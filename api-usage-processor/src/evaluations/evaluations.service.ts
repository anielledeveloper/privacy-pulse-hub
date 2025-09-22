import { Injectable, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Guideline } from '../database/models/guideline.model';
import { Evaluation } from '../database/models/evaluation.model';
import { GuidelineDailyAggregate } from '../database/models/guideline-daily-aggregate.model';
import { SubmissionLock } from '../database/models/submission-lock.model';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { DatabaseService } from '../database/database.service';
import { ConsentsService } from '../consents/consents.service';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectModel(Guideline)
    private readonly guidelineModel: typeof Guideline,
    @InjectModel(Evaluation)
    private readonly evaluationModel: typeof Evaluation,
    @InjectModel(GuidelineDailyAggregate)
    private readonly aggregateModel: typeof GuidelineDailyAggregate,
    @InjectModel(SubmissionLock)
    private readonly lockModel: typeof SubmissionLock,
    private readonly databaseService: DatabaseService,
    private readonly consentsService: ConsentsService,
  ) {}

  async create(createEvaluationDto: CreateEvaluationDto) {
    const { deviceId, consentVersion, evaluations } = createEvaluationDto;
    
    // Validate consent before processing evaluations
    const isConsentActive = await this.consentsService.isConsentActive(deviceId, consentVersion);
    if (!isConsentActive) {
      throw new ForbiddenException(
        'Active consent required for external data sharing. Please provide valid deviceId and consentVersion.'
      );
    }
    
    // Get today's date in configured timezone
    const timezone = process.env.APP_TIMEZONE || 'UTC';
    const today = dayjs().tz(timezone).format('YYYY-MM-DD');
    const todayDate = dayjs().tz(timezone).toDate();

    return await this.databaseService.transaction(async (transaction: Transaction) => {
      // Check for existing submission lock
      const existingLock = await this.lockModel.findOne({
        where: { deviceId, date: today },
        transaction,
      });

      if (existingLock) {
        // Return today's data without creating new records
        return await this.getTodayGuidelines(today);
      }

      // Create submission lock
      await this.lockModel.create(
        { deviceId, date: todayDate },
        { transaction }
      );

      // Insert evaluations with consent information
      const evaluationRecords = evaluations.map(evaluation => ({
        guidelineId: evaluation.guidelineId,
        percentage: evaluation.percentage,
        metadata: evaluation.metadata || {},
        deviceId, // Include device ID
        consentVersion, // Include consent version
      }));

      await this.evaluationModel.bulkCreate(evaluationRecords, { transaction });

      // Update daily aggregates
      await this.updateDailyAggregates(evaluations, today, transaction);

      // Return today's guidelines with updated averages
      return await this.getTodayGuidelines(today);
    });
  }

  private async updateDailyAggregates(
    evaluations: any[],
    date: string,
    transaction: Transaction,
  ) {
    // Group evaluations by guidelineId
    const grouped = evaluations.reduce((acc, evaluation) => {
      if (!acc[evaluation.guidelineId]) {
        acc[evaluation.guidelineId] = { count: 0, sum: 0 };
      }
      acc[evaluation.guidelineId].count += 1;
      acc[evaluation.guidelineId].sum += evaluation.percentage;
      return acc;
    }, {});

    // Update aggregates for each guideline
    for (const [guidelineId, stats] of Object.entries(grouped)) {
      const { count, sum } = stats as any;
      
      await this.aggregateModel.sequelize.query(`
        INSERT INTO guideline_daily_aggregates ("guidelineId", date, count, sum, average, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ("guidelineId", date)
        DO UPDATE SET
          count   = guideline_daily_aggregates.count + EXCLUDED.count,
          sum     = guideline_daily_aggregates.sum + EXCLUDED.sum,
          average = (guideline_daily_aggregates.sum + EXCLUDED.sum)::float
                    / NULLIF(guideline_daily_aggregates.count + EXCLUDED.count, 0),
          "updatedAt" = NOW();
      `, {
        bind: [guidelineId, date, count, sum, sum / count],
        transaction,
      });
    }
  }

  private async getTodayGuidelines(date: string) {
    const guidelines = await this.guidelineModel.findAll({
      include: [{
        model: GuidelineDailyAggregate,
        where: { date },
        required: false,
      }],
      order: [['id', 'ASC']],
    });

    return guidelines.map(guideline => ({
      id: guideline.id,
      text: guideline.text,
      metadata: guideline.metadata,
      averagePercentage: guideline.dailyAggregates?.[0]?.average || 0,
      totalResponses: guideline.dailyAggregates?.[0]?.count || 0,
    }));
  }
}

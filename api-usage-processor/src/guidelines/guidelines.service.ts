import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Guideline } from '../database/models/guideline.model';
import { GuidelineDailyAggregate } from '../database/models/guideline-daily-aggregate.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GuidelinesService {
  constructor(
    @InjectModel(Guideline)
    private readonly guidelineModel: typeof Guideline,
    @InjectModel(GuidelineDailyAggregate)
    private readonly aggregateModel: typeof GuidelineDailyAggregate,
  ) {}

  async findAll(date?: string) {
    const targetDate = date || dayjs().tz(process.env.APP_TIMEZONE || 'UTC').format('YYYY-MM-DD');
    
    // Get all guidelines
    const guidelines = await this.guidelineModel.findAll({
      order: [['id', 'ASC']],
    });

    // Get aggregates for the target date
    const aggregates = await this.aggregateModel.findAll({
      where: { date: targetDate },
    });

    // Create a map of guidelineId to aggregate data
    const aggregateMap = aggregates.reduce((acc, aggregate) => {
      acc[aggregate.guidelineId] = aggregate;
      return acc;
    }, {});

    return guidelines.map(guideline => ({
      id: guideline.id,
      text: guideline.text,
      metadata: guideline.metadata,
      averagePercentage: aggregateMap[guideline.id]?.average || 0,
      totalResponses: aggregateMap[guideline.id]?.count || 0,
    }));
  }

  async getHistory(days: number) {
    const endDate = dayjs().tz(process.env.APP_TIMEZONE || 'UTC');
    const startDate = endDate.subtract(days - 1, 'day');
    
    // Get aggregates for the date range
    const aggregates = await this.aggregateModel.findAll({
      where: {
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
        },
      },
      order: [
        ['guidelineId', 'ASC'],
        ['date', 'ASC'],
      ],
    });

    // Get all guidelines for reference
    const guidelines = await this.guidelineModel.findAll({
      attributes: ['id', 'text', 'metadata'],
    });

    // Create a map of guidelineId to guideline data
    const guidelineMap = guidelines.reduce((acc, guideline) => {
      acc[guideline.id] = guideline;
      return acc;
    }, {});

    // Group by guideline and format for chart data
    const grouped = aggregates.reduce((acc, aggregate) => {
      const guidelineId = aggregate.guidelineId;
      const guideline = guidelineMap[guidelineId];
      
      if (!acc[guidelineId]) {
        acc[guidelineId] = {
          id: guidelineId,
          text: guideline?.text || 'Unknown',
          metadata: guideline?.metadata || {},
          data: [],
        };
      }
      
      acc[guidelineId].data.push({
        date: aggregate.date,
        average: parseFloat(aggregate.average.toString()),
        count: aggregate.count,
      });
      
      return acc;
    }, {});

    return Object.values(grouped);
  }
}

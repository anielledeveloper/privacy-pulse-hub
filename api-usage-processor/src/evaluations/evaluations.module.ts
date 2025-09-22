import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { Guideline } from '../database/models/guideline.model';
import { Evaluation } from '../database/models/evaluation.model';
import { GuidelineDailyAggregate } from '../database/models/guideline-daily-aggregate.model';
import { SubmissionLock } from '../database/models/submission-lock.model';
import { DatabaseModule } from '../database/database.module';
import { ConsentsModule } from '../consents/consents.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Guideline,
      Evaluation,
      GuidelineDailyAggregate,
      SubmissionLock,
    ]),
    DatabaseModule,
    ConsentsModule, // Import to use ConsentsService
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { Guideline } from '../database/models/guideline.model';
import { GuidelineDailyAggregate } from '../database/models/guideline-daily-aggregate.model';
import { ConsentsModule } from '../consents/consents.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Guideline,
      GuidelineDailyAggregate,
    ]),
    ConsentsModule,
  ],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService],
})
export class GuidelinesModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsentsController } from './consents.controller';
import { ConsentsService } from './consents.service';
import { Consent } from '../database/models/consent.model';
import { DisclaimersModule } from '../disclaimers/disclaimers.module';

@Module({
  imports: [SequelizeModule.forFeature([Consent]), DisclaimersModule],
  controllers: [ConsentsController],
  providers: [ConsentsService],
  exports: [ConsentsService], // Export for use in other modules
})
export class ConsentsModule {}

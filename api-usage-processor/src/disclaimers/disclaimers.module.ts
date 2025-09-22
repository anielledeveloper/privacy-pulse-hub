import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DisclaimersController } from './disclaimers.controller';
import { DisclaimersService } from './disclaimers.service';
import { Disclaimer } from '../database/models/disclaimer.model';

@Module({
  imports: [SequelizeModule.forFeature([Disclaimer])],
  controllers: [DisclaimersController],
  providers: [DisclaimersService],
  exports: [DisclaimersService],
})
export class DisclaimersModule {}

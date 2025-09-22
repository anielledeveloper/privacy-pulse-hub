import { Controller, Get, Query, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { GuidelinesService } from './guidelines.service';
import { ConsentGuard } from '../guards/consent.guard';

@Controller('guidelines')
@UseGuards(ConsentGuard)
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @Get()
  async findAll(@Query('date') date?: string) {
    return this.guidelinesService.findAll(date);
  }

  @Get('history')
  async getHistory(
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
  ) {
    if (days < 1 || days > 180) {
      throw new BadRequestException('Days must be between 1 and 180');
    }
    return this.guidelinesService.getHistory(days);
  }
}

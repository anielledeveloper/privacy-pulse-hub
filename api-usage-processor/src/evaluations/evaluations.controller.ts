import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseGuards,
  BadRequestException,
  PayloadTooLargeException,
  Headers,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { ConsentGuard } from '../guards/consent.guard';

@Controller('evaluations')
@UseGuards(ThrottlerGuard, ConsentGuard)
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createEvaluationDto: CreateEvaluationDto,
    @Headers('x-client-key') clientKey?: string,
  ) {
    // Validate request size
    const maxEvaluations = parseInt(this.configService.get('MAX_EVALUATIONS_PER_REQ') || '200');
    if (createEvaluationDto.evaluations.length > maxEvaluations) {
      throw new PayloadTooLargeException(`Maximum ${maxEvaluations} evaluations per request allowed`);
    }

    // Validate client key if configured
    const apiKey = this.configService.get('API_SHARED_KEY');
    if (apiKey && clientKey !== apiKey) {
      throw new BadRequestException('Invalid client key');
    }

    return this.evaluationsService.create(createEvaluationDto);
  }
}

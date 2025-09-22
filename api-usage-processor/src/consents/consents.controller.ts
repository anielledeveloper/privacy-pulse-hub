import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { CreateConsentDto, WithdrawConsentDto, ConsentResponseDto, ConsentStatusDto } from '../dto/consent.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('consents')
@Controller('consents')
@UseGuards(ThrottlerGuard)
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update consent for external data sharing' })
  @ApiResponse({ 
    status: 201, 
    description: 'Consent created/updated successfully',
    type: ConsentResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid consent data' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createConsent(@Body() createConsentDto: CreateConsentDto): Promise<ConsentResponseDto> {
    return this.consentsService.createConsent(createConsentDto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw consent for external data sharing' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consent withdrawn successfully',
    type: ConsentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Consent not found' })
  @ApiResponse({ status: 409, description: 'Consent already withdrawn' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async withdrawConsent(@Body() withdrawConsentDto: WithdrawConsentDto): Promise<ConsentResponseDto> {
    return this.consentsService.withdrawConsent(withdrawConsentDto);
  }

  @Get('status/:deviceId/:consentVersion')
  @ApiOperation({ summary: 'Check consent status for a device and version' })
  @ApiParam({ name: 'deviceId', description: 'Device identifier (UUID)' })
  @ApiParam({ name: 'consentVersion', description: 'Consent agreement version' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consent status retrieved successfully',
    type: ConsentStatusDto 
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getConsentStatus(
    @Param('deviceId') deviceId: string,
    @Param('consentVersion') consentVersion: string,
  ): Promise<ConsentStatusDto> {
    return this.consentsService.getConsentStatus(deviceId, consentVersion);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active consents' })
  @ApiResponse({ 
    status: 200, 
    description: 'Active consents retrieved successfully',
    type: [ConsentResponseDto] 
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getActiveConsents(): Promise<ConsentResponseDto[]> {
    return this.consentsService.getActiveConsents();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get consent statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consent statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of consents' },
        active: { type: 'number', description: 'Number of active consents' },
        withdrawn: { type: 'number', description: 'Number of withdrawn consents' },
        averageDuration: { type: 'number', description: 'Average duration of active consents in days' },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getConsentStats() {
    return this.consentsService.getConsentStats();
  }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Consent } from '../database/models/consent.model';
import { CreateConsentDto, WithdrawConsentDto, ConsentResponseDto, ConsentStatusDto } from '../dto/consent.dto';
import { Transaction } from 'sequelize';
import { DisclaimersService } from '../disclaimers/disclaimers.service';

@Injectable()
export class ConsentsService {
  constructor(
    @InjectModel(Consent)
    private readonly consentModel: typeof Consent,
    private readonly disclaimersService: DisclaimersService,
  ) {}

  async createConsent(createConsentDto: CreateConsentDto, transaction?: Transaction): Promise<ConsentResponseDto> {
    // Validate disclaimer hash before creating consent
    const disclaimerValidation = await this.disclaimersService.validateDisclaimerVersion(
      createConsentDto.consentVersion,
      createConsentDto.disclaimerText || ''
    );

    if (!disclaimerValidation.isValid) {
      throw new BadRequestException('Disclaimer text does not match the expected hash for this version');
    }

    // Check if consent already exists for this device and version
    const existingConsent = await this.consentModel.findOne({
      where: { 
        deviceId: createConsentDto.deviceId,
        consentVersion: createConsentDto.consentVersion
      },
    });

    if (existingConsent) {
      // Update existing consent
      await existingConsent.update({
        consentTextHash: createConsentDto.consentTextHash,
        agreedAt: new Date(createConsentDto.agreedAt),
        evidence: createConsentDto.evidence,
        withdrawnAt: null, // Reactivate consent
        disclaimerId: disclaimerValidation.disclaimer!.id,
      }, { transaction });
    } else {
      // Create new consent only if no existing consent for this device+version combination
      await this.consentModel.create({
        deviceId: createConsentDto.deviceId,
        consentVersion: createConsentDto.consentVersion,
        consentTextHash: createConsentDto.consentTextHash,
        agreedAt: new Date(createConsentDto.agreedAt),
        evidence: createConsentDto.evidence,
        disclaimerId: disclaimerValidation.disclaimer!.id,
      }, { transaction });
    }

    // Return the updated/created consent
    const consent = await this.consentModel.findOne({
      where: { 
        deviceId: createConsentDto.deviceId,
        consentVersion: createConsentDto.consentVersion
      },
    });

    if (!consent) {
      throw new Error('Failed to create/update consent');
    }

    return this.mapToResponseDto(consent);
  }

  async withdrawConsent(withdrawConsentDto: WithdrawConsentDto, transaction?: Transaction): Promise<ConsentResponseDto> {
    const consent = await this.consentModel.findOne({
      where: {
        deviceId: withdrawConsentDto.deviceId,
        consentVersion: withdrawConsentDto.consentVersion,
      },
    });

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    if (consent.withdrawnAt) {
      throw new ConflictException('Consent already withdrawn');
    }

    await consent.update({
      withdrawnAt: new Date(),
    }, { transaction });

    return this.mapToResponseDto(consent);
  }

  async getConsentStatus(deviceId: string, consentVersion: string): Promise<ConsentStatusDto> {
    const consent = await this.consentModel.findOne({
      where: {
        deviceId,
        consentVersion,
      },
    });

    if (!consent) {
      return {
        deviceId,
        consentVersion,
        status: 'not_found',
      };
    }

    return {
      deviceId: consent.deviceId,
      consentVersion: consent.consentVersion,
      status: consent.getStatus(),
      agreedAt: consent.agreedAt,
      withdrawnAt: consent.withdrawnAt,
      duration: consent.getDuration(),
    };
  }

  async getConsentByDeviceId(deviceId: string): Promise<ConsentResponseDto | null> {
    const consent = await this.consentModel.findOne({
      where: {
        deviceId,
        withdrawnAt: null, // Only active consents
      },
      order: [['agreedAt', 'DESC']], // Get the most recent active consent
    });

    return consent ? this.mapToResponseDto(consent) : null;
  }

  async isConsentActive(deviceId: string, consentVersion: string): Promise<boolean> {
    const consent = await this.consentModel.findOne({
      where: {
        deviceId,
        consentVersion,
        withdrawnAt: null, // Only active consents
      },
    });

    return !!consent;
  }

  async getActiveConsents(): Promise<ConsentResponseDto[]> {
    const consents = await this.consentModel.findAll({
      where: {
        withdrawnAt: null,
      },
      order: [['agreedAt', 'DESC']],
    });

    return consents.map(consent => this.mapToResponseDto(consent));
  }

  async getConsentStats(): Promise<{
    total: number;
    active: number;
    withdrawn: number;
    averageDuration: number;
  }> {
    const total = await this.consentModel.count();
    const active = await this.consentModel.count({
      where: { withdrawnAt: null },
    });
    const withdrawn = total - active;

    // Calculate average duration for active consents
    const activeConsents = await this.consentModel.findAll({
      where: { withdrawnAt: null },
    });

    const totalDuration = activeConsents.reduce((sum, consent) => sum + consent.getDuration(), 0);
    const averageDuration = activeConsents.length > 0 ? Math.round(totalDuration / activeConsents.length) : 0;

    return {
      total,
      active,
      withdrawn,
      averageDuration,
    };
  }

  private mapToResponseDto(consent: Consent): ConsentResponseDto {
    return {
      id: consent.id,
      deviceId: consent.deviceId,
      consentVersion: consent.consentVersion,
      consentTextHash: consent.consentTextHash,
      agreedAt: consent.agreedAt,
      evidence: consent.evidence,
      withdrawnAt: consent.withdrawnAt,
      status: consent.getStatus(),
      duration: consent.getDuration(),
      createdAt: consent.createdAt,
      updatedAt: consent.updatedAt,
    };
  }
}

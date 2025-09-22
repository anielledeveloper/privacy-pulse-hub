import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Disclaimer } from '../database/models/disclaimer.model';
import { CreateDisclaimerDto, UpdateDisclaimerDto, DisclaimerResponseDto } from './dto/disclaimer.dto';
import * as crypto from 'crypto';

@Injectable()
export class DisclaimersService {
  constructor(
    @InjectModel(Disclaimer)
    private readonly disclaimerModel: typeof Disclaimer,
  ) {}

  async createDisclaimer(createDisclaimerDto: CreateDisclaimerDto, transaction?: Transaction): Promise<DisclaimerResponseDto> {
    // Generate hash from the disclaimer text
    const disclaimerHash = this.generateHash(createDisclaimerDto.disclaimerText);

    // Check if a disclaimer with this hash already exists
    const existingDisclaimer = await this.disclaimerModel.findOne({
      where: { disclaimerHash },
    });

    if (existingDisclaimer) {
      throw new BadRequestException('A disclaimer with this exact text already exists');
    }

    // Create new disclaimer
    const disclaimer = await this.disclaimerModel.create({
      version: createDisclaimerDto.version,
      disclaimerText: createDisclaimerDto.disclaimerText,
      disclaimerHash,
      isActive: createDisclaimerDto.isActive ?? true,
    }, { transaction });

    return this.mapToResponseDto(disclaimer);
  }

  async updateDisclaimer(id: number, updateDisclaimerDto: UpdateDisclaimerDto, transaction?: Transaction): Promise<DisclaimerResponseDto> {
    const disclaimer = await this.disclaimerModel.findByPk(id);
    if (!disclaimer) {
      throw new NotFoundException(`Disclaimer with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = { ...updateDisclaimerDto };
    
    // If text is being updated, regenerate hash
    if (updateDisclaimerDto.disclaimerText) {
      updateData.disclaimerHash = this.generateHash(updateDisclaimerDto.disclaimerText);
    }

    await disclaimer.update(updateData, { transaction });
    return this.mapToResponseDto(disclaimer);
  }

  async getDisclaimer(id: number): Promise<DisclaimerResponseDto> {
    const disclaimer = await this.disclaimerModel.findByPk(id);
    if (!disclaimer) {
      throw new NotFoundException(`Disclaimer with ID ${id} not found`);
    }
    return this.mapToResponseDto(disclaimer);
  }

  async getActiveDisclaimer(): Promise<DisclaimerResponseDto> {
    const disclaimer = await this.disclaimerModel.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    if (!disclaimer) {
      throw new NotFoundException('No active disclaimer found');
    }

    return this.mapToResponseDto(disclaimer);
  }

  async getAllDisclaimers(): Promise<DisclaimerResponseDto[]> {
    const disclaimers = await this.disclaimerModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return disclaimers.map(d => this.mapToResponseDto(d));
  }

  async deactivateDisclaimer(id: number, transaction?: Transaction): Promise<void> {
    const disclaimer = await this.disclaimerModel.findByPk(id);
    if (!disclaimer) {
      throw new NotFoundException(`Disclaimer with ID ${id} not found`);
    }

    await disclaimer.update({ isActive: false }, { transaction });
  }

  validateDisclaimerHash(disclaimerText: string, expectedHash: string): boolean {
    const actualHash = this.generateHash(disclaimerText);
    return actualHash === expectedHash;
  }

  async validateDisclaimerVersion(version: string, disclaimerText: string): Promise<{ isValid: boolean; disclaimer?: DisclaimerResponseDto }> {
    const disclaimer = await this.disclaimerModel.findOne({
      where: { version, isActive: true },
    });

    if (!disclaimer) {
      return { isValid: false };
    }

    // Validate that the provided text matches the stored hash
    const isValid = this.validateDisclaimerHash(disclaimerText, disclaimer.disclaimerHash);
    
    if (isValid) {
      return { isValid: true, disclaimer: this.mapToResponseDto(disclaimer) };
    }

    return { isValid: false };
  }

  private generateHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  private mapToResponseDto(disclaimer: Disclaimer): DisclaimerResponseDto {
    return {
      id: disclaimer.id,
      version: disclaimer.version,
      disclaimerText: disclaimer.disclaimerText,
      disclaimerHash: disclaimer.disclaimerHash,
      isActive: disclaimer.isActive,
      createdAt: disclaimer.createdAt,
      updatedAt: disclaimer.updatedAt,
    };
  }
}

import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateConsentDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  consentVersion: string;

  @IsString()
  @IsNotEmpty()
  consentTextHash: string;

  @IsString()
  @IsNotEmpty()
  disclaimerText: string;

  @IsDateString()
  @IsNotEmpty()
  agreedAt: string;

  @IsString()
  @IsNotEmpty()
  evidence: string;
}

export class WithdrawConsentDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  consentVersion: string;
}

export class ConsentResponseDto {
  id: number;
  deviceId: string;
  consentVersion: string;
  consentTextHash: string;
  agreedAt: Date;
  evidence: string;
  withdrawnAt?: Date;
  status: 'active' | 'withdrawn';
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ConsentStatusDto {
  deviceId: string;
  consentVersion: string;
  status: 'active' | 'withdrawn' | 'not_found';
  agreedAt?: Date;
  withdrawnAt?: Date;
  duration?: number;
}

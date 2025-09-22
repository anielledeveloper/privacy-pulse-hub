import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDisclaimerDto {
  @IsString()
  version!: string;

  @IsString()
  disclaimerText!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDisclaimerDto {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  disclaimerText?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DisclaimerResponseDto {
  id!: number;
  version!: string;
  disclaimerText!: string;
  disclaimerHash!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ValidateDisclaimerDto {
  @IsString()
  version!: string;

  @IsString()
  disclaimerText!: string;
}

export class ValidateDisclaimerResponseDto {
  isValid!: boolean;
  disclaimer?: DisclaimerResponseDto;
  error?: string;
}

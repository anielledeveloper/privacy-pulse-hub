import { IsString, IsArray, IsNumber, Min, Max, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluationItemDto {
  @IsString()
  guidelineId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateEvaluationDto {
  @IsString()
  deviceId: string;

  @IsString()
  consentVersion: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationItemDto)
  evaluations: EvaluationItemDto[];
}

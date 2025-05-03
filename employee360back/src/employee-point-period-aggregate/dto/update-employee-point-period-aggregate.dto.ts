import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateEmployeePointPeriodAggregateDto {
  @IsOptional()
  @IsNumber()
  evaluateeId?: number;

  @IsOptional()
  @IsNumber()
  pointTypeId?: number;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  averageScore?: number;

  @IsOptional()
  @IsNumber()
  numberOfEvaluations?: number;
}

import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateEmployeePointPeriodAggregateDto {
  @IsNotEmpty()
  @IsNumber()
  evaluateeId: number;

  @IsNotEmpty()
  @IsNumber()
  pointTypeId: number;

  @IsNotEmpty()
  @IsString()
  period: string;

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

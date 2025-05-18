import { IsOptional, IsNumber } from 'class-validator';

export class UpdateTaskEstimationDto {
  @IsOptional()
  @IsNumber()
  totalEstimatedTime?: number;

  @IsOptional()
  @IsNumber()
  totalRealizedTime?: number;

  @IsOptional()
  @IsNumber()
  numberOfDueDateViolations?: number;

  @IsOptional()
  @IsNumber()
  totalViolationPeriod?: number;

  @IsOptional()
  periodStart?: Date;

  @IsOptional()
  periodEnd?: Date;

  @IsOptional()
  dueDateViolations?: { date: Date }[];
}

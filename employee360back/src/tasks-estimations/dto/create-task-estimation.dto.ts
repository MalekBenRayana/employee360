import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskEstimationDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

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

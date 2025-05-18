import { IsOptional } from 'class-validator';

export class GetTaskEstimationByPeriodDto {
  @IsOptional()
  periodStart?: Date;

  @IsOptional()
  periodEnd?: Date;
}

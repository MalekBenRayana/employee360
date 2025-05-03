import { IsOptional, IsNumber } from 'class-validator';

export class UpdatePerformancePointChangeDto {
  @IsOptional()
  @IsNumber()
  responseValueId?: number;

  @IsOptional()
  @IsNumber()
  pointTypeId?: number;

  @IsOptional()
  @IsNumber()
  score?: number;
}

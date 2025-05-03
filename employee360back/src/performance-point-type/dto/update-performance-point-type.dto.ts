import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdatePerformancePointTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

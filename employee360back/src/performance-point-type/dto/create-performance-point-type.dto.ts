import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePerformancePointTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}

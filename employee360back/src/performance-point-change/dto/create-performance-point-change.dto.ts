import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePerformancePointChangeDto {
  @IsNotEmpty()
  @IsNumber()
  responseValueId: number;

  @IsNotEmpty()
  @IsNumber()
  pointTypeId: number;

  @IsNotEmpty()
  @IsNumber()
  score: number;
}

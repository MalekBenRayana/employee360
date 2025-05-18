import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

interface ExternalTimeTrackingData {
  userId: number;
  retards?: number;
  debut: string;
  fin: string;
  heures: number;
  [key: string]: any;
}

export class ExternalTimeTrackingInputDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  data: ExternalTimeTrackingData[];
}

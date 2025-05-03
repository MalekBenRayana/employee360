import { IsNumber, IsOptional } from 'class-validator';

export class UpdateFormulaDto {
  @IsOptional()
  @IsNumber()
  formId?: number;

  @IsOptional()
  expression?: Record<string, string>;
}

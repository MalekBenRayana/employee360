import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFormulaDto {
  @IsNotEmpty()
  @IsNumber()
  formId: number;

  @IsOptional()
  expression: Record<string, string>;
}

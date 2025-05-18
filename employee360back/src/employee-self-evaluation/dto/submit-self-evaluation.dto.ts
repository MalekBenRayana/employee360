// src/employee-self-evaluation/dto/submit-self-evaluation.dto.ts
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SubmitSelfEvaluationDto {
  @IsNotEmpty()
  sessionId: number;

  @IsNotEmpty()
  evaluateeId: number;

  @IsNotEmpty()
  pointTypeId: number;

  @IsNumber()
  score: number;

  @IsOptional()
  label?: string;
}

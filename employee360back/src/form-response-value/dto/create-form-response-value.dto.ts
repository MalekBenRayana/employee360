import { EvaluationResponse } from 'src/evaluation-response/evaluation-response.entity';

export class CreateFormResponseValueDto {
  evaluationResponse: EvaluationResponse;
  fieldKey: string;
  fieldValue: string;
  aiFeedback?: string | null;
}

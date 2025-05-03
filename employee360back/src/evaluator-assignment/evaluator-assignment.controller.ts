import { Controller, Post, Body, Param } from '@nestjs/common';
import { EvaluatorAssignmentService } from './evaluator-assignment.service';

@Controller('evaluator-assignments')
export class EvaluatorAssignmentController {
  constructor(
    private readonly evaluatorAssignmentService: EvaluatorAssignmentService,
  ) {}

  @Post(':sessionId/evaluators/:evaluatorId')
  async assignEvaluator(
    @Param('sessionId') sessionId: string,
    @Param('evaluatorId') evaluatorId: string,
  ): Promise<any> {
    return this.evaluatorAssignmentService.create(+sessionId, +evaluatorId);
  }
}

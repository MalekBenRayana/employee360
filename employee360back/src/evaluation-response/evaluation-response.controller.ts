import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EvaluationResponseService } from './evaluation-response.service';
import { EvaluationResponse } from './evaluation-response.entity';

interface SubmitEvaluationResponseDto {
  sessionId: number;
  evaluatorId: number;
  evaluateeId: number;
  answers: any;
  score?: number;
}

@Controller('evaluation-responses')
export class EvaluationResponseController {
  constructor(private readonly service: EvaluationResponseService) {}

  @Post()
  async submit(
    @Body() data: SubmitEvaluationResponseDto,
  ): Promise<EvaluationResponse> {
    console.log('Le contrôleur submit a été atteint:', data);
    const { sessionId, evaluatorId, evaluateeId, answers, score } = data;
    return this.service.submitResponse({
      sessionId,
      evaluatorId,
      evaluateeId,
      answers,
      score,
    });
  }

  @Get('session/:id')
  findBySession(@Param('id') id: number): Promise<EvaluationResponse[]> {
    return this.service.findBySession(id);
  }

  @Get('evaluator/:id')
  findByEvaluator(@Param('id') id: number): Promise<EvaluationResponse[]> {
    return this.service.findByEvaluator(id);
  }

  @Get('evaluatee/:id')
  findByEvaluatee(@Param('id') id: number): Promise<EvaluationResponse[]> {
    return this.service.findByEvaluatee(id);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<EvaluationResponse> {
    return this.service.findById(id);
  }
}

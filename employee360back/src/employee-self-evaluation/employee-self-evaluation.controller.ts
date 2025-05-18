import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { EmployeeSelfEvaluationService } from './employee-self-evaluation.service';
import { EmployeeSelfEvaluation } from './employee-self-evaluation.entity';
import { SubmitSelfEvaluationDto } from './dto/submit-self-evaluation.dto';

@Controller('employee-self-evaluations')
export class EmployeeSelfEvaluationController {
  constructor(
    private readonly employeeSelfEvaluationService: EmployeeSelfEvaluationService,
  ) {}

  @Post('submit')
  async submitSelfEvaluation(
    @Body() submitDto: SubmitSelfEvaluationDto,
  ): Promise<EmployeeSelfEvaluation> {
    return this.employeeSelfEvaluationService.submitSelfEvaluation(
      submitDto.sessionId,
      submitDto.evaluateeId,
      submitDto.pointTypeId,
      submitDto.score,
      submitDto.label,
    );
  }

  @Get()
  async findAll(): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmployeeSelfEvaluation> {
    return this.employeeSelfEvaluationService.findOne(+id);
  }

  @Get('by-evaluatee-period')
  async findByEvaluateeAndPeriod(
    @Query('evaluateeId') evaluateeId: string,
    @Query('period') period: string,
  ): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationService.findAllByEvaluateeAndPeriod(
      +evaluateeId,
      period,
    );
  }

  @Get('by-session/:sessionId')
  async findBySessionId(
    @Param('sessionId') sessionId: string,
  ): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationService.findSelfEvaluationBySessionId(
      +sessionId,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { EvaluationSessionService } from './evaluation-session.service';
import { EvaluationSession } from './evaluation-session.entity';

@Controller('evaluation-sessions')
export class EvaluationSessionController {
  constructor(private readonly service: EvaluationSessionService) {}

  @Post()
  async create(
    @Body() data: any,
  ): Promise<{ sessionId: number; session: EvaluationSession }> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<EvaluationSession[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EvaluationSession> {
    return this.service.findOne(id);
  }

  @Put(':id/start')
  startSession(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EvaluationSession> {
    return this.service.startSession(id);
  }

  @Put(':id/close')
  closeSession(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EvaluationSession> {
    return this.service.closeSession(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<EvaluationSession> {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.deleteSession(id);
  }

  @Get('employee/:employeeId')
  async getEmployeeEvaluationSessions(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ): Promise<{
    toEvaluate: EvaluationSession[];
    selfEvaluation: EvaluationSession[];
  }> {
    return this.service.getEvaluationSessionsForEmployee(employeeId);
  }

  @Get('assigned/:employeeId')
  async getAssignedEvaluationSessions(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ): Promise<EvaluationSession[]> {
    return this.service.getEvaluationSessionsAssignedToEmployee(employeeId);
  }

  @Get('self/:employeeId')
  async getSelfEvaluationSessions(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ): Promise<EvaluationSession[]> {
    return this.service.getSelfEvaluationSessionsForEmployee(employeeId);
  }
}

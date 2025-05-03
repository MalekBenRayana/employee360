import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
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
  findOne(@Param('id') id: number): Promise<EvaluationSession> {
    return this.service.findOne(id);
  }

  @Put(':id/start')
  startSession(@Param('id') id: number): Promise<EvaluationSession> {
    return this.service.startSession(id);
  }

  @Put(':id/close')
  closeSession(@Param('id') id: number): Promise<EvaluationSession> {
    return this.service.closeSession(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ): Promise<EvaluationSession> {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.service.deleteSession(id);
  }
}

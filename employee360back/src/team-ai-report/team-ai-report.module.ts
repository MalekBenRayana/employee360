// src/team-ai-report/team-ai-report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamAiReportService } from './team-ai-report.service';
// Importez toutes les entités nécessaires pour les dépôts dans TeamAiReportService
import { User } from '../user/user.entity';

import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';
import { AiEvaluationReport } from 'src/ai-evaluation-report/ai-evaluation-report.entity';
import { Project } from 'src/projects/project.entity';
import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { TeamAiReportController } from './team-ai-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Project,
      AiEvaluationReport,
      PerformancePointType,
      PerformancePointChange,
      EvaluationSession,
      EvaluationResponse,
    ]),
  ],
  providers: [TeamAiReportService],
  exports: [TeamAiReportService],
  controllers: [TeamAiReportController],

})
export class TeamAiReportModule {}

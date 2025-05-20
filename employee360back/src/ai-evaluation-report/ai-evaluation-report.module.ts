import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiEvaluationReport } from './ai-evaluation-report.entity';
import { AiEvaluationReportService } from './ai-evaluation-report.service';
import { AiEvaluationReportController } from './ai-evaluation-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiEvaluationReport])],
  providers: [AiEvaluationReportService],
  controllers: [AiEvaluationReportController],
  exports: [AiEvaluationReportService],
})
export class AiEvaluationReportModule {}

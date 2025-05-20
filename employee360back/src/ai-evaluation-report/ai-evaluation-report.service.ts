import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiEvaluationReport } from './ai-evaluation-report.entity';
import { AiEvaluationReport as AiReportContentInterface } from '../ai-scoring/ai-scoring.service';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';
import { User } from '../user/user.entity';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { EvaluationForm } from '../evaluation-form/evaluation-form.entity';

@Injectable()
export class AiEvaluationReportService {
  private readonly logger = new Logger(AiEvaluationReportService.name);

  constructor(
    @InjectRepository(AiEvaluationReport)
    private readonly aiReportRepo: Repository<AiEvaluationReport>,
  ) {}

  async createReport(
    evaluationResponse: EvaluationResponse,
    evaluatee: User,
    session: EvaluationSession,
    form: EvaluationForm,
    reportContent: AiReportContentInterface,
  ): Promise<AiEvaluationReport> {
    this.logger.log(
      `Creating AI evaluation report for response ID: ${evaluationResponse.id}`,
    );

    const aiReport = this.aiReportRepo.create({
      // --- CORRECTION 1.1 : NE PAS PASSER L'OBJET ENTITY DIRECTEMENT LORS DU CREATE
      // La relation sera établie via evaluationResponseId
      evaluationResponseId: evaluationResponse.id, // Liaison explicite par ID
      evaluateeId: evaluatee.id,
      sessionId: session.id,
      formId: form.id,
      reportContent: reportContent,
      // --- CORRECTION 1.2 : overallSummary doit être de type string | null dans l'entité
      // ici, c'est déjà `reportContent.overallSummary || null`, ce qui est bon si l'entité accepte `null`
      overallSummary: reportContent.overallSummary || null,
    });

    return this.aiReportRepo.save(aiReport);
  }

  async findByEvaluationResponseId(
    responseId: number,
  ): Promise<AiEvaluationReport | null> {
    return this.aiReportRepo.findOne({
      where: { evaluationResponseId: responseId },
      relations: ['evaluationResponse'],
    });
  }

  async findByEvaluateeId(evaluateeId: number): Promise<AiEvaluationReport[]> {
    return this.aiReportRepo.find({
      where: { evaluateeId: evaluateeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySessionId(sessionId: number): Promise<AiEvaluationReport[]> {
    return this.aiReportRepo.find({
      where: { sessionId: sessionId },
      order: { createdAt: 'DESC' },
    });
  }
}

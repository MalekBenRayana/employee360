import {
  Controller,
  Get,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AiEvaluationReportService } from './ai-evaluation-report.service';
import { AiEvaluationReport } from './ai-evaluation-report.entity';

@Controller('ai-evaluation-reports')
export class AiEvaluationReportController {
  private readonly logger = new Logger(AiEvaluationReportController.name);

  constructor(private readonly aiReportService: AiEvaluationReportService) {}

  @Get('by-response/:responseId')
  async findByEvaluationResponseId(
    @Param('responseId') responseId: string,
  ): Promise<AiEvaluationReport> {
    this.logger.log(
      `Requête pour récupérer le rapport AI par responseId: ${responseId}`,
    );
    const report =
      await this.aiReportService.findByEvaluationResponseId(+responseId);

    if (!report) {
      this.logger.warn(
        `Aucun rapport AI trouvé pour l'ID de réponse: ${responseId}`,
      );
      throw new NotFoundException(
        `Aucun rapport d'évaluation AI trouvé pour l'ID de réponse ${responseId}`,
      );
    }

    this.logger.log(`Rapport AI trouvé pour responseId: ${responseId}`);
    return report;
  }

  @Get('by-evaluatee/:evaluateeId')
  async findByEvaluateeId(
    @Param('evaluateeId') evaluateeId: string,
  ): Promise<AiEvaluationReport[]> {
    this.logger.log(
      `Requête pour récupérer les rapports AI par evaluateeId: ${evaluateeId}`,
    );
    try {
      const reports =
        await this.aiReportService.findByEvaluateeId(+evaluateeId);
      this.logger.log(
        `${reports.length} rapports AI trouvés pour evaluateeId: ${evaluateeId}`,
      );
      return reports;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rapports AI pour evaluateeId ${evaluateeId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des rapports d'évaluation AI.",
      );
    }
  }
}

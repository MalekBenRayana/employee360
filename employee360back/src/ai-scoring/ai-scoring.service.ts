import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

/**
 * Interface définissant la structure du rapport d'évaluation généré par l'IA.
 * Cette interface est exportée pour être utilisée dans d'autres services.
 */
export interface AiEvaluationReport {
  overallSummary: string | null; // Peut être null si l'IA ne génère pas de résumé
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  performanceStatistics?: {
    averageScore?: number;
    highestScoreCategory?: string;
    lowestScoreCategory?: string;
  };
  rawFeedbackByQuestion?: { [questionId: string]: string };
  conclusion?: string;
}

@Injectable()
export class AiScoringService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiScoringService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Demande à l'IA de noter une réponse textuelle spécifique basée sur des critères définis.
   * @param questionText La question à laquelle l'utilisateur a répondu.
   * @param userAnswer La réponse textuelle de l'utilisateur.
   * @returns Un objet contenant le score numérique et le feedback textuel de l'IA.
   */
  async scoreTextResponse(
    questionText: string,
    userAnswer: string,
  ): Promise<{ score: number; feedback: string }> {
    const prompt = `
      Vous êtes un évaluateur expert pour les réponses d'employés aux questions d'évaluation.
      La question posée était : "${questionText}"
      La réponse de l'employé est : "${userAnswer}"

      Veuillez évaluer la réponse de l'employé(e) en vous basant sur les critères suivants :
      1.  **Clarté** : La réponse est-elle facile à comprendre et bien articulée ? (Notez sur 5)
      2.  **Pertinence** : La réponse aborde-t-elle directement la question ? (Notez sur 5)
      3.  **Exhaustivité** : La réponse couvre-t-elle tous les aspects nécessaires de la question ? (Notez sur 5)
      4.  **Profondeur d'analyse** : La réponse démontre-t-elle une compréhension approfondie ou une pensée originale ? (Notez sur 5)

      Fournissez un score pour chaque critère et un score global total sur 5.
      Fournissez également un **feedback textuel concis et détaillé en français** expliquant les points forts et les points faibles de la réponse.

      Retournez le résultat au format JSON uniquement, comme ceci :
      {
        "clarity_score": [nombre],
        "relevance_score": [nombre],
        "completeness_score": [nombre],
        "insightfulness_score": [nombre],
        "overall_score": [nombre],
        "feedback": "chaîne_de_caractères en français"
      }
    `;

    try {
      this.logger.log(`Sending prompt to Gemini for scoring: ${questionText}`);

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Conserver une température basse pour plus de précision dans le scoring
          maxOutputTokens: 500,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseContent = response.text();

      if (!responseContent) {
        this.logger.error(
          'Gemini API returned empty content. No score or feedback generated.',
        );
        throw new Error('Gemini API returned empty content.');
      }

      this.logger.debug(`Received response from Gemini: ${responseContent}`);

      const parsedResponse = JSON.parse(responseContent);

      const overallScore =
        parsedResponse.overall_score ||
        (parsedResponse.clarity_score +
          parsedResponse.relevance_score +
          parsedResponse.completeness_score +
          parsedResponse.insightfulness_score) /
          4;

      return {
        score: parseFloat(overallScore.toFixed(1)),
        feedback:
          parsedResponse.feedback || "Aucun feedback détaillé fourni par l'IA.",
      };
    } catch (error) {
      this.logger.error(
        'Error calling Gemini API for scoring:',
        (error as Error).message,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to score response with AI (Gemini): ${(error as Error).message}`,
      );
    }
  }

  /**
   * Génère un rapport d'évaluation complet pour un employé basé sur toutes les réponses et le contexte.
   * @param employeeName Le nom complet de l'employé évalué.
   * @param context Un contexte général pour le rapport.
   * @param answers Un tableau d'objets contenant les détails de chaque réponse (question, réponse, score AI, feedback AI).
   * @param formStructure La structure JSON complète du formulaire d'évaluation.
   * @returns Un objet conforme à l'interface AiEvaluationReport.
   */
  async generateEvaluationReport(
    employeeName: string,
    context: string,
    answers: {
      questionId: string;
      questionLabel: string;
      answer: any;
      score?: number;
      aiFeedback?: string;
    }[],
    formStructure: any, // Votre structure de formulaire complète
  ): Promise<AiEvaluationReport> {
    this.logger.log(
      `Génération du rapport d'évaluation AI complet pour ${employeeName}`,
    );

    // Construis le prompt pour générer le rapport complet
    const prompt = `
      Vous êtes un évaluateur RH expert. En vous basant sur le contexte d'évaluation et les réponses de l'employé(e) suivants,
      générez un rapport d'évaluation de performance complet pour "${employeeName}".
      Le rapport doit être professionnel, perspicace et actionable.

      **Contexte Général de l'Évaluation :**
      ${context}

      **Structure du Formulaire d'Évaluation (pour référence sur les types de questions et sections) :**
      ${JSON.stringify(formStructure, null, 2)}

      **Réponses Détaillées de l'Employé(e) et Feedback de l'IA (le cas échéant) :**
      ${answers
        .map(
          (a) => `
        - ID de la question : "${a.questionId}"
          Question : "${a.questionLabel}"
          Réponse de l'employé(e) : "${a.answer}"
          ${a.score !== undefined ? `Score numérique de l'IA (sur 5) : ${a.score}` : ''}
          ${a.aiFeedback ? `Feedback spécifique de l'IA pour cette question : "${a.aiFeedback}"` : ''}
      `,
        )
        .join('\n')}

      Veuillez fournir le rapport complet au format JSON structuré. Assurez-vous que toutes les sections sont présentes.
      La structure JSON doit respecter strictement cette interface TypeScript (les noms des clés doivent rester en anglais pour la compatibilité du code, mais les valeurs des **chaînes de caractères** doivent être en français) :

      interface AiEvaluationReport {
        overallSummary: string | null; // Résumé global
        strengths: string[]; // Points forts
        areasForImprovement: string[]; // Domaines à améliorer
        specificRecommendations: string[]; // Recommandations spécifiques
        performanceStatistics?: {
          averageScore?: number; // Score moyen
          highestScoreCategory?: string; // Catégorie avec le score le plus élevé
          lowestScoreCategory?: string; // Catégorie avec le score le plus bas
        };
        rawFeedbackByQuestion?: { [questionId: string]: string }; // Feedback brut par question
        conclusion?: string; // Conclusion
      }

      Fournissez des recommandations actionnables et un résumé global clair.
      Si un score moyen numérique peut être dérivé des scores de l'IA, incluez-le dans performanceStatistics.
      Mappez le feedback brut de l'IA aux identifiants de question correspondants dans rawFeedbackByQuestion.
      **TOUTES les valeurs textuelles (résumés, points forts, domaines d'amélioration, recommandations, feedbacks individuels, conclusions) doivent être en français.**
    `;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
          maxOutputTokens: 2000,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseContent = response.text();

      if (!responseContent) {
        this.logger.error(
          'Gemini API returned empty content for report generation.',
        );
        throw new Error(
          'Gemini API returned empty content for report generation.',
        );
      }

      this.logger.debug(
        `Received full report from Gemini (first 500 chars): ${responseContent.substring(0, 500)}...`,
      );

      const parsedReport: AiEvaluationReport = JSON.parse(responseContent);

      if (
        !parsedReport.overallSummary ||
        !Array.isArray(parsedReport.strengths)
      ) {
        this.logger.warn(
          'AI generated report might be incomplete or malformed.',
        );
      }

      return parsedReport;
    } catch (error) {
      this.logger.error(
        `Error generating full AI evaluation report for ${employeeName}:`,
        (error as Error).message,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to generate full AI report: ${(error as Error).message}`,
      );
    }
  }
}

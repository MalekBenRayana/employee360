// src/evaluation-response/evaluation-response.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormResponseValueService } from '../form-response-value/form-response-value.service';
import { EvaluationResponse } from './evaluation-response.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { User } from 'src/user/user.entity';
import { EvaluationForm } from 'src/evaluation-form/evaluation-form.entity';
import { Formula } from 'src/formula/formula.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { EmployeePointPeriodAggregateService } from '../employee-point-period-aggregate/employee-point-period-aggregate.service';
import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';
import { EmployeeSelfEvaluationService } from '../employee-self-evaluation/employee-self-evaluation.service';
import { AiScoringService } from '../ai-scoring/ai-scoring.service';
import { AiEvaluationReportService } from '../ai-evaluation-report/ai-evaluation-report.service';
import { AiEvaluationReport as AiReportContentInterface } from '../ai-scoring/ai-scoring.service';

// Interface pour les données soumises lors de la réponse
interface SubmitResponseData {
  sessionId?: number;
  evaluatorId?: number;
  evaluateeId?: number;
  answers?: any; // Les réponses du formulaire
  score?: number; // Score initial (peut être écrasé par le calcul)
}

@Injectable()
export class EvaluationResponseService {
  constructor(
    @InjectRepository(EvaluationResponse)
    private readonly responseRepo: Repository<EvaluationResponse>,
    @InjectRepository(EvaluationSession)
    private readonly sessionRepo: Repository<EvaluationSession>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(EvaluationForm)
    private readonly evaluationFormRepository: Repository<EvaluationForm>,
    @InjectRepository(Formula)
    private readonly formulaRepo: Repository<Formula>,
    @InjectRepository(PerformancePointChange)
    private readonly performancePointChangeRepo: Repository<PerformancePointChange>,
    private readonly formResponseValueService: FormResponseValueService,
    private readonly employeePointPeriodAggregateService: EmployeePointPeriodAggregateService,
    @InjectRepository(PerformancePointType)
    private readonly performancePointTypeRepo: Repository<PerformancePointType>,
    private readonly employeeSelfEvaluationService: EmployeeSelfEvaluationService,
    private readonly aiScoringService: AiScoringService,
    private readonly aiEvaluationReportService: AiEvaluationReportService,
  ) {}

  /**
   * Traite la soumission d'une réponse d'évaluation, incluant le scoring IA et la génération de rapport.
   * @param data Les données de la réponse soumise.
   * @returns L'entité EvaluationResponse sauvegardée avec toutes les relations.
   */
  async submitResponse(data: SubmitResponseData): Promise<EvaluationResponse> {
    const {
      sessionId,
      evaluatorId,
      evaluateeId,
      answers,
      score: initialScore,
    } = data;

    if (!sessionId || !evaluatorId || !evaluateeId) {
      throw new Error(
        "Les IDs de la session, de l'évaluateur et de l'évalué sont requis.",
      );
    }

    // Récupérer les entités nécessaires
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['form', 'evaluatee', 'form.formulas'],
    });
    const evaluator = await this.userRepo.findOne({
      where: { id: evaluatorId },
    });
    const evaluatee = await this.userRepo.findOne({
      where: { id: evaluateeId },
    });

    if (!session) {
      throw new NotFoundException(
        `Session d'évaluation avec l'ID ${sessionId} non trouvée.`,
      );
    }
    if (!evaluator) {
      throw new NotFoundException(
        `Évaluateur avec l'ID ${evaluatorId} non trouvé.`,
      );
    }
    if (!evaluatee) {
      throw new NotFoundException(
        `Évalué avec l'ID ${evaluateeId} non trouvé.`,
      );
    }

    // DEBUG: Log pour form_structure
    if (session && session.form) {
      console.log(
        '[DEBUG] Type of session.form.form_structure (before parsing):',
        typeof session.form.form_structure,
      );
      console.log(
        '[DEBUG] Content of session.form.form_structure (before parsing):',
        session.form.form_structure,
      );
    }

    // Créer la réponse d'évaluation initiale
    const response = this.responseRepo.create({
      session,
      evaluator,
      evaluatee,
      score: initialScore,
      responseValues: [], // Sera rempli plus tard
    });

    const savedResponse = await this.responseRepo.save(response);
    console.log('[SUBMIT RESPONSE] savedResponse ID:', savedResponse.id);

    let calculatedTotalScore = 0;
    const aggregatedScoresByType: {
      [pointTypeId: number]: { sum: number; count: number };
    } = {};

    // Variable pour collecter les réponses et feedbacks pour le rapport AI
    const aiReportAnswers: {
      questionId: string;
      questionLabel: string;
      answer: any;
      score?: number;
      aiFeedback?: string;
    }[] = [];

    if (
      answers &&
      session.form &&
      session.form.formulas &&
      session.form.formulas.length > 0
    ) {
      let formStructureQuestions: any[] = [];
      if (session.form.form_structure) {
        try {
          // Tente de parser si c'est une chaîne, sinon utilise directement l'objet
          const parsedFormStructure =
            typeof session.form.form_structure === 'string'
              ? JSON.parse(session.form.form_structure)
              : session.form.form_structure;

          if (
            parsedFormStructure &&
            Array.isArray(parsedFormStructure.questions)
          ) {
            formStructureQuestions = parsedFormStructure.questions;
          } else {
            console.warn(
              "[WARNING] Parsed form_structure does not contain a 'questions' array or is invalid.",
            );
          }
        } catch (e) {
          console.error('[ERROR] Could not parse form_structure:', e);
          formStructureQuestions = []; // Assurez-vous que c'est un tableau vide en cas d'erreur
        }
      }

      console.log(
        '[DEBUG] Contenu de formStructureQuestions (after parsing):',
        JSON.stringify(formStructureQuestions, null, 2),
      );

      if (!formStructureQuestions || formStructureQuestions.length === 0) {
        console.warn(
          '[WARNING] No questions found in form structure or form structure is invalid after processing. Skipping question-based logic.',
        );
      }

      const formula = session.form.formulas[0];
      const formulaExpressions = formula?.expression || {};

      // Parcourir toutes les réponses soumises
      for (const submittedKey in answers) {
        const answer = answers[submittedKey];
        const question = formStructureQuestions.find(
          (q) => q.id === submittedKey,
        );

        console.log(
          '[SUBMIT RESPONSE - ANSWER] Clé soumise:',
          submittedKey,
          'Réponse:',
          answer,
          'Question trouvée:',
          !!question,
        );

        if (!question) {
          console.log(
            `[DEBUG - MISMATCH] Looking for ID "${submittedKey}", but available question IDs in form_structure are:`,
            formStructureQuestions.map((q) => q.id),
          );
        }

        if (question) {
          console.log(
            `[DEBUG] Question ID: ${question.id}, Question Type: "${question.type}"`,
          );

          let valueToStoreInFieldValue: string = String(answer);
          let aiFeedback: string | undefined = undefined;
          let aiNumericScore: number | null = null;

          // LOGIQUE DE NOTATION PAR IA POUR LES QUESTIONS TEXTUELLES
          console.log(
            `[DEBUG - AI TYPE CHECK RAW] Question Type String (before AI condition): "${question.type}"`,
          );
          if (
            question.type === 'text-long' ||
            question.type === 'text-short' ||
            question.type === 'text_long'
          ) {
            console.log(
              `[DEBUG - AI CHECK] Inside AI scoring conditional for question ID: ${question.id}, type: "${question.type}"`,
            );
            console.log(
              `[EVALUATION RESPONSE SERVICE] Attempting AI scoring for question ID: ${question.id}`,
            );
            try {
              const aiResult = await this.aiScoringService.scoreTextResponse(
                question.label || question.id, // Utilise le label de la question comme texte pour l'IA
                String(answer),
              );
              aiNumericScore = aiResult.score;
              aiFeedback = aiResult.feedback;
              valueToStoreInFieldValue = String(aiNumericScore.toFixed(1)); // Stocke le score AI si réussi
              console.log(
                `[EVALUATION RESPONSE SERVICE] AI Scoring successful for ${question.id}. Score: ${aiNumericScore}, Feedback: ${aiFeedback}`,
              );
            } catch (aiError) {
              console.error(
                `[EVALUATION RESPONSE SERVICE - AI ERROR] Could not score text response for question ID ${question.id}:`,
                (aiError as Error).message,
                (aiError as Error).stack,
              );
              valueToStoreInFieldValue = String(answer); // Garde la réponse originale en cas d'échec de l'IA
              aiNumericScore = 0; // Attribue une note de 0 pour le calcul en cas d'échec
              aiFeedback = `Échec de la notation par IA (Gemini) : ${(aiError as Error).message}`;
            }
          }
          // FIN LOGIQUE DE NOTATION PAR IA

          try {
            console.log(
              `[EVALUATION RESPONSE SERVICE] Preparing FormResponseValue: fieldKey=${question.id}, fieldValue=${valueToStoreInFieldValue}, aiFeedback=${aiFeedback}`,
            );
            const responseValueRecord =
              await this.formResponseValueService.create({
                evaluationResponse: savedResponse,
                fieldKey: question.id,
                fieldValue: valueToStoreInFieldValue,
                aiFeedback: aiFeedback, // Sauvegarde le feedback AI dans la réponse
              });
            console.log(
              '[EVALUATION RESPONSE SERVICE] FormResponseValue créé:',
              responseValueRecord,
            );

            // Collecter les données pour le rapport AI
            aiReportAnswers.push({
              questionId: question.id,
              questionLabel: question.label || question.id,
              answer: answer, // La réponse originale de l'utilisateur
              score: aiNumericScore !== null ? aiNumericScore : undefined, // Le score AI si disponible
              aiFeedback: aiFeedback, // Le feedback AI si disponible
            });

            // Logique de calcul du score pour le performancePointChange
            if (
              question.performancePointTypeId &&
              formulaExpressions[question.id]
            ) {
              const performancePointType =
                await this.performancePointTypeRepo.findOne({
                  where: { id: question.performancePointTypeId },
                });

              if (performancePointType) {
                let calculatedScoreForQuestion: number | null = null;
                const expression = formulaExpressions[question.id];

                // Prioriser la note de l'IA si disponible pour le calcul des points de performance
                if (aiNumericScore !== null) {
                  calculatedScoreForQuestion =
                    aiNumericScore * performancePointType.weight;
                } else if (expression === 'weight * response') {
                  const evaluatedResponse = !isNaN(Number(answer))
                    ? Number(answer)
                    : answer;
                  calculatedScoreForQuestion =
                    performancePointType.weight * evaluatedResponse;
                } else if (expression?.startsWith('map') && answer) {
                  const mapDefinition = expression.substring(
                    expression.indexOf('{') + 1,
                    expression.lastIndexOf('}'),
                  );
                  const mapping: { [key: string]: number } = {};
                  mapDefinition.split(',').forEach((pair) => {
                    const [key, value] = pair
                      .trim()
                      .split(':')
                      .map((s) => s.trim().replace(/'/g, ''));
                    mapping[key] = parseFloat(value);
                  });
                  calculatedScoreForQuestion =
                    (mapping[answer] || 0) * performancePointType.weight;
                }

                if (calculatedScoreForQuestion !== null) {
                  const pointChange = this.performancePointChangeRepo.create({
                    responseValue: responseValueRecord,
                    pointType: performancePointType,
                    score: calculatedScoreForQuestion,
                  });
                  await this.performancePointChangeRepo.save(pointChange);
                  console.log(
                    '[SUBMIT RESPONSE - POINT CHANGE] PerformancePointChange créé:',
                    pointChange.id,
                    'pour le type:',
                    performancePointType.id,
                    'score:',
                    calculatedScoreForQuestion,
                  );
                  calculatedTotalScore += calculatedScoreForQuestion;

                  if (!aggregatedScoresByType[performancePointType.id]) {
                    aggregatedScoresByType[performancePointType.id] = {
                      sum: 0,
                      count: 0,
                    };
                  }
                  aggregatedScoresByType[performancePointType.id].sum +=
                    calculatedScoreForQuestion;
                  aggregatedScoresByType[performancePointType.id].count++;
                }
              }
            }
          } catch (error) {
            console.error(
              '[SUBMIT RESPONSE - ERROR] Erreur lors de la création de FormResponseValue ou PerformancePointChange:',
              error,
            );
          }
        } else {
          console.warn(
            `[SUBMIT RESPONSE - WARNING] Question avec l'ID ${submittedKey} non trouvée dans la structure du formulaire.`,
          );
        }
      }

      console.log(
        '[SUBMIT RESPONSE] Score total calculé pour la réponse ID:',
        savedResponse.id,
        ':',
        calculatedTotalScore.toFixed(2),
      );

      // Mettre à jour le score total de la réponse d'évaluation
      await this.responseRepo.update(savedResponse.id, {
        score: parseFloat(calculatedTotalScore.toFixed(2)),
      });
      console.log(
        '[SUBMIT RESPONSE] Entité EvaluationResponse mise à jour avec le score total (sans toucher aux autres champs).',
      );

      // Logique pour l'auto-évaluation (si l'évaluateur est l'évalué)
      if (evaluatorId === evaluateeId && session && evaluatee) {
        for (const pointTypeIdStr in aggregatedScoresByType) {
          const { sum, count } = aggregatedScoresByType[pointTypeIdStr];
          const averageScore = count > 0 ? sum / count : null;
          const pointTypeId = parseInt(pointTypeIdStr);
          const pointType = await this.performancePointTypeRepo.findOne({
            where: { id: pointTypeId },
          });

          if (averageScore !== null && pointType) {
            const selfEvaluationRecord =
              await this.employeeSelfEvaluationService.create({
                evaluatee: evaluatee,
                period: session.startDate?.toISOString().split('T')[0] || 'N/A',
                pointType: pointType,
                score: averageScore,
                evaluationSession: session,
              });
            console.log(
              '[SUBMIT RESPONSE] Auto-évaluation enregistrée dans employee_self_evaluation pour le type:',
              pointType.id,
              'avec le score:',
              averageScore,
              'ID:',
              selfEvaluationRecord.id,
            );
          }
        }
      }

      // Logique pour l'agrégation des points de performance par période
      if (session.evaluatee) {
        const evaluateeIdForAggregate = session.evaluatee.id;
        const evaluationDate = session.startDate || new Date();
        const year = evaluationDate.getFullYear();
        const month = evaluationDate.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const periodForAggregate = `${year}-Q${quarter}`;

        console.log(
          `[AGGREGATE - START] Traitement pour l'évalué ID: ${evaluateeIdForAggregate}, Période: ${periodForAggregate}`,
        );

        const performancePointChangesForAggregate =
          await this.performancePointChangeRepo.find({
            where: {
              responseValue: {
                evaluationResponse: {
                  evaluatee: { id: evaluateeIdForAggregate },
                },
              },
            },
            relations: [
              'pointType',
              'responseValue',
              'responseValue.evaluationResponse',
              'responseValue.evaluationResponse.evaluatee',
              'responseValue.evaluationResponse.session',
            ],
          });
        console.log(
          '[AGGREGATE - FIND CHANGES DEBUG] PerformancePointChanges trouvés:',
          performancePointChangesForAggregate.map((pc) => ({
            id: pc.id,
            score: pc.score,
            pointTypeId: pc.pointType?.id,
            responseValueId: pc.responseValue?.id,
            evaluationResponseId: pc.responseValue?.evaluationResponse?.id,
            evaluateeId: pc.responseValue?.evaluationResponse?.evaluatee?.id,
            sessionStartDate:
              pc.responseValue?.evaluationResponse?.session?.startDate,
          })),
        );
        console.log(
          `[AGGREGATE - FIND CHANGES] Nombre de PerformancePointChanges trouvés pour l'évalué ${evaluateeIdForAggregate}: ${performancePointChangesForAggregate.filter((pc) => pc.responseValue?.evaluationResponse?.evaluatee?.id === evaluateeIdForAggregate).length}`,
        );

        const currentAggregatedScoresAggregate: {
          [pointTypeId: number]: { sum: number; count: number };
        } = {};
        performancePointChangesForAggregate.forEach((change) => {
          const changeEvaluationDate =
            change.responseValue?.evaluationResponse?.session?.startDate ||
            new Date();
          const changeYear = changeEvaluationDate.getFullYear();
          const changeMonth = changeEvaluationDate.getMonth();
          const changeQuarter = Math.floor(changeMonth / 3) + 1;
          const changePeriod = `${changeYear}-Q${changeQuarter}`;

          if (change.pointType?.id && changePeriod === periodForAggregate) {
            if (!currentAggregatedScoresAggregate[change.pointType.id]) {
              currentAggregatedScoresAggregate[change.pointType.id] = {
                sum: 0,
                count: 0,
              };
            }
            currentAggregatedScoresAggregate[change.pointType.id].sum +=
              change.score;
            currentAggregatedScoresAggregate[change.pointType.id].count++;
          }
        });
        console.log(
          `[AGGREGATE - CURRENT SCORES] Scores agrégés (période actuelle) pour l'évalué ${evaluateeIdForAggregate}:`,
          currentAggregatedScoresAggregate,
        );

        for (const pointTypeId in currentAggregatedScoresAggregate) {
          const { sum, count } = currentAggregatedScoresAggregate[pointTypeId];
          const averageScore = count > 0 ? sum / count : null;
          const currentPointTypeId = parseInt(pointTypeId);

          console.log(
            `[AGGREGATE - FIND EXISTING] Recherche de l'agrégat existant pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}, Période: ${periodForAggregate}`,
          );
          const existingAggregate =
            await this.employeePointPeriodAggregateService.findByEvaluateeAndPeriodAndPointType(
              evaluateeIdForAggregate,
              periodForAggregate,
              currentPointTypeId,
            );
          console.log(
            `[AGGREGATE - EXISTING FOUND] Agrégat existant trouvé pour l'évalué ${evaluateeIdForAggregate}, PointType ID ${currentPointTypeId}:`,
            existingAggregate?.id,
          );

          const pointType = await this.performancePointTypeRepo.findOne({
            where: { id: currentPointTypeId },
          });

          if (averageScore !== null && pointType) {
            if (existingAggregate) {
              console.log(
                `[AGGREGATE - UPDATE - DEBUG] Mise à jour avec: evaluateeId=${evaluateeIdForAggregate}, period=${periodForAggregate}, pointTypeId=${currentPointTypeId}, averageScore=${averageScore}, evaluations=${count}`,
              );
              await this.employeePointPeriodAggregateService.update(
                existingAggregate.id,
                {
                  averageScore: averageScore,
                  numberOfEvaluations: count,
                },
              );
              console.log(
                `[AGGREGATE - UPDATED] Agrégat mis à jour pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}`,
              );
            } else {
              console.log(
                `[AGGREGATE - CREATE - DEBUG] Création avec: evaluateeId=${evaluateeIdForAggregate}, period=${periodForAggregate}, pointTypeId=${currentPointTypeId}, averageScore=${averageScore}`,
              );
              await this.employeePointPeriodAggregateService.create({
                evaluatee: session.evaluatee,
                pointType: pointType,
                period: periodForAggregate,
                averageScore: averageScore,
                numberOfEvaluations: count,
              });
              console.log(
                `[AGGREGATE - CREATED] Nouvel agrégat créé pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}`,
              );
            }
          }
        }
      }
    }

    // NOUVELLE LOGIQUE : Génération du Rapport AI après tout le traitement des réponses individuelles
    if (aiReportAnswers.length > 0 && session.form) {
      console.log('[AI REPORT] Initiating AI report generation...');
      try {
        // Utilise 'username' pour l'utilisateur et l'ID de session pour la session
        const context = `Rapport de performance pour ${evaluatee.username} (ID: ${evaluatee.id}). Évaluation réalisée par ${evaluator.username} (ID: ${evaluator.id}) pour la session ID: ${session.id}.`;

        // Récupère la structure complète du formulaire
        const formStructure =
          typeof session.form.form_structure === 'string'
            ? JSON.parse(session.form.form_structure)
            : session.form.form_structure;

        // Appeler le service de scoring AI pour générer le contenu du rapport
        const aiReportContent: AiReportContentInterface =
          await this.aiScoringService.generateEvaluationReport(
            `${evaluatee.username}`, // Passe le username au service AI pour le nom de l'évalué
            context,
            aiReportAnswers,
            formStructure, // Passe la structure complète du formulaire
          );

        // Sauvegarder le rapport AI généré via le service dédié
        await this.aiEvaluationReportService.createReport(
          savedResponse,
          evaluatee,
          session,
          session.form,
          aiReportContent,
        );
        console.log(
          '[AI REPORT] AI evaluation report successfully created and linked to response ID:',
          savedResponse.id,
        );
      } catch (aiReportError) {
        console.error(
          '[AI REPORT ERROR] Failed to generate or save AI evaluation report:',
          (aiReportError as Error).message,
          (aiReportError as Error).stack,
        );
        // Ne pas jeter l'erreur ici pour ne pas bloquer la soumission de la réponse
      }
    } else {
      console.log(
        '[AI REPORT] No text-based answers found for AI report generation or form structure is missing.',
      );
    }

    // Recharger la réponse pour inclure toutes les relations, y compris le rapport AI
    const loadedResponse = await this.responseRepo.findOne({
      where: { id: savedResponse.id },
      relations: [
        'evaluator',
        'evaluatee',
        'session',
        'session.form',
        'responseValues',
        'aiReport', // Charger la relation avec le rapport AI
      ],
    });
    if (!loadedResponse) {
      throw new NotFoundException(
        `Impossible de charger la réponse après la sauvegarde.`,
      );
    }
    return loadedResponse;
  }

  // Méthodes de recherche existantes
  async findBySession(sessionId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { session: { id: sessionId } },
      relations: ['evaluator', 'evaluatee', 'responseValues', 'aiReport'], // Ajoute aiReport
    });
  }

  async findByEvaluator(evaluatorId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { evaluator: { id: evaluatorId } },
      relations: ['evaluatee', 'session', 'responseValues', 'aiReport'], // Ajoute aiReport
    });
  }

  async findByEvaluatee(evaluateeId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { evaluatee: { id: evaluateeId } },
      relations: ['evaluator', 'session', 'responseValues', 'aiReport'], // Ajoute aiReport
    });
  }

  async findById(id: number): Promise<EvaluationResponse> {
    const response = await this.responseRepo.findOne({
      where: { id },
      relations: [
        'evaluator',
        'evaluatee',
        'session',
        'session.form',
        'responseValues',
        'aiReport', // Ajoute aiReport
      ],
    });

    if (!response) {
      throw new NotFoundException(`Réponse avec l'ID ${id} non trouvée`);
    }

    return response;
  }

  async findByForm(formId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { session: { form: { id: formId } } },
      relations: [
        'evaluator',
        'evaluatee',
        'session',
        'responseValues',
        'aiReport',
      ], // Ajoute aiReport
    });
  }
}
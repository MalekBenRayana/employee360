import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FormResponseValueService } from '../form-response-value/form-response-value.service';
import { EvaluationResponse } from './evaluation-response.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { User } from 'src/user/user.entity';
import { EvaluationForm } from 'src/evaluation-form/evaluation-form.entity';
import { Formula } from 'src/formula/formula.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { EmployeePointPeriodAggregateService } from '../employee-point-period-aggregate/employee-point-period-aggregate.service';
import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';

interface SubmitResponseData {
  sessionId?: number;
  evaluatorId?: number;
  evaluateeId?: number;
  answers?: any;
  score?: number;
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
  ) {}

  async submitResponse(data: SubmitResponseData): Promise<EvaluationResponse> {
    const { sessionId, evaluatorId, evaluateeId, answers, score } = data;

    if (!sessionId || !evaluatorId || !evaluateeId) {
      throw new Error(
        "Les IDs de la session, de l'évaluateur et de l'évalué sont requis.",
      );
    }

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

    const response = this.responseRepo.create({
      session,
      evaluator,
      evaluatee,
      score,
      responseValues: [],
    });

    const savedResponse = await this.responseRepo.save(response);

    if (
      answers &&
      session.form &&
      session.form.form_structure?.questions &&
      session.form.formulas &&
      session.form.formulas.length > 0
    ) {
      const formStructureQuestions = session.form.form_structure
        .questions as any[];
      const formula = session.form.formulas[0];
      const formulaExpressions = formula?.expression || {};

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

        if (question) {
          try {
            const responseValueRecord =
              await this.formResponseValueService.create({
                evaluationResponse: savedResponse,
                fieldKey: question.id,
                fieldValue: String(answer),
              });
            console.log(
              '[SUBMIT RESPONSE - FORM VALUE] FormResponseValue créé:',
              responseValueRecord.id,
            );

            if (
              question.performancePointTypeId &&
              formulaExpressions[question.id]
            ) {
              const performancePointType =
                await this.performancePointTypeRepo.findOne({
                  where: { id: question.performancePointTypeId },
                });

              if (performancePointType) {
                const expression = formulaExpressions[question.id];
                let calculatedScore: number | null = null;

                if (expression === 'weight * response') {
                  const evaluatedResponse = !isNaN(Number(answer))
                    ? Number(answer)
                    : answer;
                  calculatedScore =
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
                  calculatedScore =
                    (mapping[answer] || 0) * performancePointType.weight;
                }

                if (calculatedScore !== null) {
                  const pointChange = this.performancePointChangeRepo.create({
                    responseValue: responseValueRecord,
                    pointType: performancePointType,
                    score: calculatedScore,
                  });
                  await this.performancePointChangeRepo.save(pointChange);
                  console.log(
                    '[SUBMIT RESPONSE - POINT CHANGE] PerformancePointChange créé:',
                    pointChange.id,
                    'pour le type:',
                    performancePointType.id,
                    'score:',
                    calculatedScore,
                  );
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
            "[SUBMIT RESPONSE - WARNING] Question avec l'ID ${submittedKey} non trouvée dans la structure du formulaire.",
          );
        }
      }

      if (session.evaluatee) {
        const evaluateeIdForAggregate = session.evaluatee.id;
        const yearForAggregate = new Date(session.startDate || new Date())
          .getFullYear()
          .toString();
        console.log(
          `[AGGREGATE - START] Traitement pour l'évalué ID: ${evaluateeIdForAggregate}, Année: ${yearForAggregate}`,
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
          })),
        );
        console.log(
          `[AGGREGATE - FIND CHANGES] Nombre de PerformancePointChanges trouvés pour l'évalué ${evaluateeIdForAggregate}: ${performancePointChangesForAggregate.filter((pc) => pc.responseValue?.evaluationResponse?.evaluatee?.id === 11).length}`,
        );

        const aggregatedScores: {
          [pointTypeId: number]: { sum: number; count: number };
        } = {};
        performancePointChangesForAggregate.forEach((change) => {
          if (change.pointType?.id) {
            if (!aggregatedScores[change.pointType.id]) {
              aggregatedScores[change.pointType.id] = { sum: 0, count: 0 };
            }
            aggregatedScores[change.pointType.id].sum += change.score;
            aggregatedScores[change.pointType.id].count++;
          }
        });
        console.log(
          "[AGGREGATE - SCORES] Scores agrégés pour l'évalué ${evaluateeIdForAggregate}:",
          aggregatedScores,
        );

        for (const pointTypeId in aggregatedScores) {
          const { sum, count } = aggregatedScores[pointTypeId];
          const averageScore = count > 0 ? sum / count : null;
          const currentPointTypeId = parseInt(pointTypeId);

          console.log(
            `[AGGREGATE - FIND EXISTING] Recherche de l'agrégat existant pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}, Année: ${yearForAggregate}`,
          );
          const existingAggregate =
            await this.employeePointPeriodAggregateService.findByEvaluateeAndPeriodAndPointType(
              evaluateeIdForAggregate,
              yearForAggregate,
              currentPointTypeId,
            );
          console.log(
            "[AGGREGATE - EXISTING FOUND] Agrégat existant trouvé pour l'évalué ${evaluateeIdForAggregate}, PointType ID ${currentPointTypeId}:",
            existingAggregate?.id,
          );

          const pointType = await this.performancePointTypeRepo.findOne({
            where: { id: currentPointTypeId },
          });

          if (existingAggregate && pointType) {
            console.log(
              `[AGGREGATE - UPDATE] Mise à jour de l'agrégat ID ${existingAggregate.id} pour l'évalué ${evaluateeIdForAggregate}, PointType ID ${currentPointTypeId}, averageScore: ${averageScore}, numberOfEvaluations: ${existingAggregate.numberOfEvaluations + 1}`,
            );
            await this.employeePointPeriodAggregateService.update(
              existingAggregate.id,
              {
                averageScore: averageScore,
                numberOfEvaluations: existingAggregate.numberOfEvaluations + 1,
              },
            );
            console.log(
              `[AGGREGATE - UPDATED] Agrégat mis à jour pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}`,
            );
          } else if (pointType) {
            console.log(
              `[AGGREGATE - CREATE] Création d'un nouvel agrégat pour l'évalué ${evaluateeIdForAggregate}, PointType ID ${currentPointTypeId}, Année: ${yearForAggregate}, averageScore: ${averageScore}, numberOfEvaluations: 1`,
            );
            await this.employeePointPeriodAggregateService.create({
              evaluatee: session.evaluatee,
              pointType: pointType,
              period: yearForAggregate,
              averageScore: averageScore,
              numberOfEvaluations: 1,
            });
            console.log(
              `[AGGREGATE - CREATED] Nouvel agrégat créé pour l'évalué ${evaluateeIdForAggregate}, PointType ID: ${currentPointTypeId}`,
            );
          }
        }
      }
    }

    const loadedResponse = await this.responseRepo.findOne({
      where: { id: savedResponse.id },
      relations: [
        'evaluator',
        'evaluatee',
        'session',
        'session.form',
        'responseValues',
        'responseValues.evaluationResponse',
        'responseValues.evaluationResponse.session',
      ],
    });
    if (!loadedResponse) {
      throw new NotFoundException(
        `Impossible de charger la réponse après la sauvegarde.`,
      );
    }
    return loadedResponse;
  }

  async findBySession(sessionId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { session: { id: sessionId } },
      relations: ['evaluator', 'evaluatee', 'responseValues'],
    });
  }

  async findByEvaluator(evaluatorId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { evaluator: { id: evaluatorId } },
      relations: ['evaluatee', 'session', 'responseValues'],
    });
  }

  async findByEvaluatee(evaluateeId: number): Promise<EvaluationResponse[]> {
    return this.responseRepo.find({
      where: { evaluatee: { id: evaluateeId } },
      relations: ['evaluator', 'session', 'responseValues'],
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
      relations: ['evaluator', 'evaluatee', 'session', 'responseValues'],
    });
  }
}

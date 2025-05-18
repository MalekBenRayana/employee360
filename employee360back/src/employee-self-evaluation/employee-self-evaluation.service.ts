import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSelfEvaluation } from './employee-self-evaluation.entity';
import { UserService } from '../user/user.service';
import { PerformancePointTypeService } from '../performance-point-type/performance-point-type.service';
import { EvaluationSessionService } from '../evaluation-session/evaluation-session.service';

@Injectable()
export class EmployeeSelfEvaluationService {
  constructor(
    @InjectRepository(EmployeeSelfEvaluation)
    private readonly employeeSelfEvaluationRepository: Repository<EmployeeSelfEvaluation>,
    private readonly userService: UserService,
    private readonly performancePointTypeService: PerformancePointTypeService,
    private readonly evaluationSessionService: EvaluationSessionService,
  ) {}

  async create(
    selfEvaluation: Partial<EmployeeSelfEvaluation>,
  ): Promise<EmployeeSelfEvaluation> {
    return this.employeeSelfEvaluationRepository.save(
      this.employeeSelfEvaluationRepository.create(selfEvaluation),
    );
  }

  async findAll(): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationRepository.find({
      relations: ['evaluatee', 'pointType', 'evaluationSession'],
    });
  }

  async findOne(id: number): Promise<EmployeeSelfEvaluation> {
    return this.employeeSelfEvaluationRepository.findOneOrFail({
      where: { id },
      relations: ['evaluatee', 'pointType', 'evaluationSession'],
    });
  }

  async findByEvaluateeAndPeriodAndPointType(
    evaluateeId: number,
    period: string,
    pointTypeId: number,
  ): Promise<EmployeeSelfEvaluation | null> {
    return this.employeeSelfEvaluationRepository.findOne({
      where: {
        evaluatee: { id: evaluateeId },
        period,
        pointType: { id: pointTypeId },
      },
      relations: ['pointType'],
    });
  }

  async findAllByEvaluateeAndPeriod(
    evaluateeId: number,
    period: string,
  ): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationRepository.find({
      where: { evaluatee: { id: evaluateeId }, period },
      relations: ['pointType'],
    });
  }

  async findSelfEvaluationBySessionId(
    sessionId: number,
  ): Promise<EmployeeSelfEvaluation[]> {
    return this.employeeSelfEvaluationRepository.find({
      where: { evaluationSession: { id: sessionId } },
      relations: ['evaluatee', 'pointType'],
    });
  }

  async submitSelfEvaluation(
    sessionId: number,
    evaluateeId: number,
    pointTypeId: number,
    score: number,
    label?: string,
  ): Promise<EmployeeSelfEvaluation> {
    const evaluatee = await this.userService.findById(evaluateeId);
    const pointType =
      await this.performancePointTypeService.findOne(pointTypeId);
    const evaluationSession =
      await this.evaluationSessionService.findOne(sessionId);

    if (!evaluatee || !pointType || !evaluationSession) {
      throw new NotFoundException(
        'Evaluatee, Point Type, or Evaluation Session not found',
      );
    }

    const selfEvaluation = this.employeeSelfEvaluationRepository.create({
      evaluatee: evaluatee,
      period: evaluationSession.startDate
        ? evaluationSession.startDate.toISOString().split('T')[0]
        : 'N/A',
      pointType: pointType,
      score: score,
      label: label,
      evaluationSession: evaluationSession,
    });

    return this.employeeSelfEvaluationRepository.save(selfEvaluation);
  }
}

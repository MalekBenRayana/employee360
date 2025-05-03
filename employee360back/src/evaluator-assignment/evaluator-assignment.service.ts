import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluatorAssignment } from './evaluator-assignment.entity';

@Injectable()
export class EvaluatorAssignmentService {
  constructor(
    @InjectRepository(EvaluatorAssignment)
    private readonly evaluatorAssignmentRepository: Repository<EvaluatorAssignment>,
  ) {}

  async create(
    sessionId: number,
    evaluatorId: number,
  ): Promise<EvaluatorAssignment> {
    const assignment = this.evaluatorAssignmentRepository.create({
      evaluationSession: { id: sessionId },
      evaluator: { id: evaluatorId },
    });
    return this.evaluatorAssignmentRepository.save(assignment);
  }

  async findBySessionId(sessionId: number): Promise<EvaluatorAssignment[]> {
    return this.evaluatorAssignmentRepository.find({
      where: { evaluationSession: { id: sessionId } },
      relations: ['evaluator'],
    });
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { User } from '../user/user.entity';

@Entity('evaluator_assignments')
export class EvaluatorAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => EvaluationSession,
    (session) => session.evaluatorAssignments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluationSession: EvaluationSession;

  @Column({ name: 'evaluation_session_id' })
  evaluationSessionId: number;

  @ManyToOne(() => User, (user) => user.assignedEvaluations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: User;

  @Column({ name: 'evaluator_id' })
  evaluatorId: number;
}

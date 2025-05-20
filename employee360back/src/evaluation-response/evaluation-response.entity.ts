import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { User } from '../user/user.entity';
import { FormResponseValue } from 'src/form-response-value/form-response-value.entity';
import { AiEvaluationReport } from 'src/ai-evaluation-report/ai-evaluation-report.entity';

@Entity('evaluation_responses')
export class EvaluationResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EvaluationSession, (session) => session.responses, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: EvaluationSession;

  @ManyToOne(() => User, (user) => user.evaluatedResponsesAsEvaluator, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluatorId' })
  evaluator: User;

  @ManyToOne(() => User, (user) => user.evaluationResponsesAsEvaluatee, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluateeId' })
  evaluatee: User;

  @OneToMany(
    () => FormResponseValue,
    (responseValue) => responseValue.evaluationResponse,
    {
      cascade: true,
    },
  )
  responseValues: FormResponseValue[];

  @OneToOne(() => AiEvaluationReport, (aiReport) => aiReport.evaluationResponse)
  aiReport: AiEvaluationReport;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}

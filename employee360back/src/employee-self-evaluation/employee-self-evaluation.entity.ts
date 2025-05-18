import { User } from 'src/user/user.entity';
import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('employee_self_evaluation')
export class EmployeeSelfEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.selfEvaluations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluateeId' })
  evaluatee: User;

  @ManyToOne(
    () => PerformancePointType,
    (pointType) => pointType.selfEvaluations,
    { eager: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'pointTypeId' })
  pointType: PerformancePointType;

  @Column({ type: 'varchar', length: 255 })
  period: string;

  @Column({ type: 'double precision' })
  score: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  evaluationDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string;

  @ManyToOne(() => EvaluationSession, (session) => session.selfEvaluations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'evaluationSessionId' })
  evaluationSession?: EvaluationSession;
}

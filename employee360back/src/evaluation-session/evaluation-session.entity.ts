import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EvaluationForm } from '../evaluation-form/evaluation-form.entity';
import { User } from '../user/user.entity';
import { Project } from '../projects/project.entity';
import { EvaluatorAssignment } from '../evaluator-assignment/evaluator-assignment.entity';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

@Entity('evaluation_sessions')
export class EvaluationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EvaluationForm, (form) => form.sessions, {
    onDelete: 'CASCADE',
  })
  form: EvaluationForm;

  @ManyToOne(() => User, (user) => user.evaluationSessionsAsEvaluatee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluatee_id' })
  evaluatee: User;

  @Column({ name: 'evaluatee_id', nullable: true })
  evaluateeId: number;

  @ManyToOne(() => Project, (project) => project.evaluationSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @OneToMany(
    () => EvaluatorAssignment,
    (assignment) => assignment.evaluationSession,
    {
      onDelete: 'CASCADE',
    },
  )
  evaluatorAssignments: EvaluatorAssignment[];

  @OneToMany(() => EvaluationResponse, (response) => response.session, {
    onDelete: 'CASCADE',
  })
  responses: EvaluationResponse[];

  setEndDate(): void {
    if (this.startDate && this.duration) {
      const start = new Date(this.startDate);
      this.endDate = new Date(start.getTime() + this.duration * 60000);
    }
  }

  get evaluators(): User[] {
    if (this.evaluatorAssignments) {
      return this.evaluatorAssignments.map(
        (assignment) => assignment.evaluator,
      );
    }
    return [];
  }
}

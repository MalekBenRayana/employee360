// src/ai-evaluation-report/ai-evaluation-report.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

@Entity('ai_evaluation_reports')
export class AiEvaluationReport {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => EvaluationResponse, (response) => response.aiReport, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluationResponseId' })
  evaluationResponse: EvaluationResponse;

  @Column({ unique: true })
  evaluationResponseId: number;

  @Column()
  evaluateeId: number;

  @Column()
  sessionId: number;

  @Column()
  formId: number;

  @Column({ type: 'jsonb' })
  reportContent: any;

  // --- LA LIGNE CORRIGÉE EST ICI ---
  @Column({ type: 'text', nullable: true })
  overallSummary: string | null; // <--- AJOUTE `| null` AU TYPE
  // --- FIN DE LA LIGNE CORRIGÉE ---

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

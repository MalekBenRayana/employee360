import { EvaluationResponse } from 'src/evaluation-response/evaluation-response.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('form_response_values')
export class FormResponseValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => EvaluationResponse,
    (evaluationResponse) => evaluationResponse.responseValues,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'formSubmissionId' })
  evaluationResponse: EvaluationResponse;

  @Column({ type: 'varchar' })
  fieldKey: string;

  @Column({ type: 'text', nullable: true })
  fieldValue: string; // Stockera la réponse brute OU le score numérique de l'IA (stringifié)

  @OneToMany(
    () => PerformancePointChange,
    (pointChange) => pointChange.responseValue,
  )
  performancePointChanges: PerformancePointChange[];
}

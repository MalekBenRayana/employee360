import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EvaluationForm } from '../evaluation-form/evaluation-form.entity';

@Entity('formulas')
export class Formula {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EvaluationForm, (form) => form.formulas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'formId' })
  form: EvaluationForm;

  @Column({ type: 'jsonb', nullable: true })
  expression: Record<string, string>;
}

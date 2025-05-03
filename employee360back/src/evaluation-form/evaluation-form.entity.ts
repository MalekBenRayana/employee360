import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { Formula } from 'src/formula/formula.entity';

@Entity('evaluation_forms')
export class EvaluationForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column('json')
  form_structure: any;

  @OneToMany(() => EvaluationSession, (session) => session.form)
  sessions: EvaluationSession[];

  @OneToMany(() => Formula, (formula) => formula.form)
  formulas: Formula[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

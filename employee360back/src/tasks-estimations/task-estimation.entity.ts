import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('task_estimations')
export class TaskEstimation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: true })
  totalEstimatedTime?: number;

  @Column({ type: 'integer', nullable: true })
  totalRealizedTime?: number;

  @Column({ type: 'integer', default: 0 })
  numberOfDueDateViolations: number;

  @Column({ type: 'integer', nullable: true })
  totalViolationPeriod?: number;

  @Column({ type: 'date', nullable: true })
  periodStart?: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd?: Date;

  @Column({ type: 'jsonb', nullable: true })
  dueDateViolations?: { date: Date }[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

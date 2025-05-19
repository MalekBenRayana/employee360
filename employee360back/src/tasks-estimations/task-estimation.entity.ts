import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

@Entity('task_estimations')
export class TaskEstimation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: true })
  totalEstimatedTime?: number | null; // Peut être un nombre ou null

  @Column({ type: 'integer', nullable: true })
  totalRealizedTime?: number | null; // Peut être un nombre ou null

  @Column({ type: 'integer', default: 0 })
  numberOfDueDateViolations: number;

  @Column({ type: 'integer', nullable: true })
  totalViolationPeriod?: number | null; // Sera la différence en minutes si positif

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

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalViolationPeriod() {
    if (
      this.totalRealizedTime !== null &&
      this.totalRealizedTime !== undefined &&
      this.totalEstimatedTime !== null &&
      this.totalEstimatedTime !== undefined
    ) {
      const differenceInMinutes =
        this.totalRealizedTime - this.totalEstimatedTime;

      if (differenceInMinutes > 0) {
        this.totalViolationPeriod = differenceInMinutes; // Stocker la différence en minutes
      } else {
        this.totalViolationPeriod = null;
      }
    } else {
      this.totalViolationPeriod = null;
    }
  }
}

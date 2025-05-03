import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employee_point_period_aggregates')
export class EmployeePointPeriodAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.pointPeriodAggregates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluateeId' })
  evaluatee: User;

  @ManyToOne(
    () => PerformancePointType,
    (pointType) => pointType.employeePointPeriodAggregates,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'pointTypeId' })
  pointType: PerformancePointType;

  @Column({ type: 'varchar', length: 255 })
  period: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string;

  @Column({ type: 'double precision', nullable: true, name: 'averageScore' })
  averageScore: number | null;

  @Column({ type: 'integer', default: 0 })
  numberOfEvaluations: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}

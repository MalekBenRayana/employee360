import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { EmployeePointPeriodAggregate } from 'src/employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { EmployeeSelfEvaluation } from 'src/employee-self-evaluation/employee-self-evaluation.entity';

@Entity('performance_point_types')
export class PerformancePointType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'float', default: 1 })
  weight: number;

  @OneToMany(
    () => PerformancePointChange,
    (performancePointChange) => performancePointChange.pointType,
  )
  performancePointChanges: PerformancePointChange[];

  @OneToMany(
    () => EmployeePointPeriodAggregate,
    (aggregate) => aggregate.pointType,
  )
  employeePointPeriodAggregates: EmployeePointPeriodAggregate[];

  @OneToMany(
    () => EmployeeSelfEvaluation,
    (selfEvaluation) => selfEvaluation.pointType,
  )
  selfEvaluations: EmployeeSelfEvaluation[];
}

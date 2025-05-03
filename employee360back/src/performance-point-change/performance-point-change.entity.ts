import { FormResponseValue } from 'src/form-response-value/form-response-value.entity';
import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('performance_point_changes')
export class PerformancePointChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => FormResponseValue,
    (responseValue) => responseValue.performancePointChanges,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'responseValueId' })
  responseValue: FormResponseValue;

  @ManyToOne(
    () => PerformancePointType,
    (pointType) => pointType.performancePointChanges,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'pointTypeId' })
  pointType: PerformancePointType;

  @Column({ type: 'float' })
  score: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  calculatedAt: Date;
}

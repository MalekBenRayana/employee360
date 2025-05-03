import { Module } from '@nestjs/common';
import { EmployeePointPeriodAggregateService } from './employee-point-period-aggregate.service';
import { EmployeePointPeriodAggregateController } from './employee-point-period-aggregate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { PerformancePointTypeModule } from 'src/performance-point-type/performance-point-type.module';
import { EmployeePointPeriodAggregate } from './employee-point-period-aggregate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeePointPeriodAggregate]),
    UserModule,
    PerformancePointTypeModule,
  ],

  providers: [EmployeePointPeriodAggregateService],
  controllers: [EmployeePointPeriodAggregateController],
  exports: [EmployeePointPeriodAggregateService, TypeOrmModule],
})
export class EmployeePointPeriodAggregateModule {}

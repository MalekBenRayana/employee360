import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';
import { DashboardController } from './dashboard.controller';
import { EvaluationForm } from 'src/evaluation-form/evaluation-form.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeePointPeriodAggregate,
      EvaluationSession,
      EvaluationResponse,
      EvaluationForm,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

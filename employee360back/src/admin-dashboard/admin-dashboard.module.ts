import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { PerformancePointType } from '../performance-point-type/performance-point-type.entity';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { PerformancePointChange } from '../performance-point-change/performance-point-change.entity';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { EvaluationResponseModule } from 'src/evaluation-response/evaluation-response.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { Project } from 'src/projects/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PerformancePointType,
      EmployeePointPeriodAggregate,
      EvaluationSession,
      PerformancePointChange,
      Project,
    ]),
    EvaluationResponseModule,
    ProjectsModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}

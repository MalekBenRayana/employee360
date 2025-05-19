import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmailModule } from './email/email.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectAssignmentLogsModule } from './project-assignment-logs/project-assignment-logs.module';
import { EvaluationFormModule } from './evaluation-form/evaluation-form.module';
import { EvaluationSessionModule } from './evaluation-session/evaluation-session.module';
import { ProjectRoleModule } from './project-role/project-role.module';
import { UserProjectRoleModule } from './user-project-role/user-project-role.module';
import { EvaluationResponseModule } from './evaluation-response/evaluation-response.module';
import { NotificationModule } from './notification/notification.module';
import { EvaluatorAssignmentModule } from './evaluator-assignment/evaluator-assignment.module';
import { FormResponseValueModule } from './form-response-value/form-response-value.module';
import { PerformancePointTypeModule } from './performance-point-type/performance-point-type.module';
import { FormulaModule } from './formula/formula.module';
import { PerformancePointChangeModule } from './performance-point-change/performance-point-change.module';
import { EmployeePointPeriodAggregateModule } from './employee-point-period-aggregate/employee-point-period-aggregate.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { EmployeeSelfEvaluationModule } from './employee-self-evaluation/employee-self-evaluation.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { TaskEstimationModule } from './tasks-estimations/tasks-estimations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'pfe',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      logging: false,
    }),
    UserModule,
    AuthModule,
    RolesModule,
    EmailModule,
    PermissionsModule,
    ProjectsModule,
    DepartmentsModule,
    ProjectAssignmentLogsModule,
    EvaluationFormModule,
    EvaluationSessionModule,
    ProjectRoleModule,
    UserProjectRoleModule,
    EvaluationResponseModule,
    NotificationModule,
    NotificationModule,
    EvaluatorAssignmentModule,
    FormResponseValueModule,
    PerformancePointTypeModule,
    FormulaModule,
    PerformancePointChangeModule,
    EmployeePointPeriodAggregateModule,
    EvaluatorAssignmentModule,
    DashboardModule,
    AdminDashboardModule,
    EmployeeSelfEvaluationModule,
    TimeTrackingModule,
    TaskEstimationModule,
  ],
})
export class AppModule {}

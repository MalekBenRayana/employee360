import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationResponseService } from './evaluation-response.service';
import { EvaluationResponse } from './evaluation-response.entity';
import { EvaluationResponseController } from './evaluation-response.controller';
import { EvaluationSessionModule } from 'src/evaluation-session/evaluation-session.module';
import { UserModule } from 'src/user/user.module';
import { EvaluationFormModule } from 'src/evaluation-form/evaluation-form.module';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { User } from 'src/user/user.entity';
import { EvaluationForm } from 'src/evaluation-form/evaluation-form.entity';
import { FormResponseValueModule } from 'src/form-response-value/form-response-value.module';
import { FormulaModule } from 'src/formula/formula.module';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { FormResponseValue } from 'src/form-response-value/form-response-value.entity';
import { Formula } from 'src/formula/formula.entity';
import { EmployeePointPeriodAggregateModule } from 'src/employee-point-period-aggregate/employee-point-period-aggregate.module';
import { PerformancePointTypeModule } from 'src/performance-point-type/performance-point-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationResponse,
      EvaluationSession,
      EvaluationForm,
      User,
      PerformancePointChange,
      FormResponseValue,
    ]),
    UserModule,
    forwardRef(() => EvaluationFormModule),
    forwardRef(() => EvaluationSessionModule),
    forwardRef(() => FormResponseValueModule), // Utilisez forwardRef ici
    FormulaModule,
    TypeOrmModule.forFeature([Formula]),
    EmployeePointPeriodAggregateModule,
    PerformancePointTypeModule,
  ],
  providers: [EvaluationResponseService],
  controllers: [EvaluationResponseController],
  exports: [EvaluationResponseService, TypeOrmModule],
})
export class EvaluationResponseModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationResponseService } from './evaluation-response.service';
import { EvaluationResponse } from './evaluation-response.entity';
import { EvaluationResponseController } from './evaluation-response.controller';
import { EvaluationSessionModule } from 'src/evaluation-session/evaluation-session.module';
import { UserModule } from 'src/user/user.module';
import { EvaluationFormModule } from 'src/evaluation-form/evaluation-form.module';
import { FormResponseValueModule } from 'src/form-response-value/form-response-value.module';
import { FormulaModule } from 'src/formula/formula.module';
import { EmployeePointPeriodAggregateModule } from 'src/employee-point-period-aggregate/employee-point-period-aggregate.module';
import { PerformancePointTypeModule } from 'src/performance-point-type/performance-point-type.module';
import { EmployeeSelfEvaluationModule } from 'src/employee-self-evaluation/employee-self-evaluation.module';
import { PerformancePointChangeModule } from 'src/performance-point-change/performance-point-change.module';
// import { AiEvaluationModule } from 'src/ai-evaluation/ai-evaluation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationResponse]),
    UserModule,
    forwardRef(() => EvaluationFormModule),
    forwardRef(() => EvaluationSessionModule),
    forwardRef(() => FormResponseValueModule),
    FormulaModule,
    EmployeePointPeriodAggregateModule,
    PerformancePointTypeModule,
    EmployeeSelfEvaluationModule,
    forwardRef(() => PerformancePointChangeModule),
    // AiEvaluationModule,
  ],
  providers: [EvaluationResponseService],
  controllers: [EvaluationResponseController],
  exports: [
    EvaluationResponseService,
    TypeOrmModule.forFeature([EvaluationResponse]),
  ],
})
export class EvaluationResponseModule {}

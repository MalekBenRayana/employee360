import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSelfEvaluation } from './employee-self-evaluation.entity';
import { EmployeeSelfEvaluationService } from './employee-self-evaluation.service';
import { EmployeeSelfEvaluationController } from './employee-self-evaluation.controller';
import { UserModule } from '../user/user.module';
import { PerformancePointTypeModule } from '../performance-point-type/performance-point-type.module';
import { EvaluationSessionModule } from '../evaluation-session/evaluation-session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeSelfEvaluation]),
    UserModule,
    PerformancePointTypeModule,
    EvaluationSessionModule,
  ],
  providers: [EmployeeSelfEvaluationService],
  controllers: [EmployeeSelfEvaluationController],
  exports: [EmployeeSelfEvaluationService],
})
export class EmployeeSelfEvaluationModule {}

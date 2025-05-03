import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationFormService } from './evaluation-form.service';
import { EvaluationForm } from './evaluation-form.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { EvaluationFormController } from './evaluation-form.controller';
import { UserModule } from 'src/user/user.module';
import { EvaluatorAssignment } from 'src/evaluator-assignment/evaluator-assignment.entity';
import { EvaluatorAssignmentService } from 'src/evaluator-assignment/evaluator-assignment.service';
import { FormResponseValueModule } from 'src/form-response-value/form-response-value.module';
import { EvaluationResponseModule } from 'src/evaluation-response/evaluation-response.module';
import { EvaluationSessionModule } from 'src/evaluation-session/evaluation-session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationSession,
      EvaluationForm,
      EvaluatorAssignment,
    ]),
    UserModule,
    FormResponseValueModule,
    forwardRef(() => EvaluationResponseModule),
    forwardRef(() => EvaluationSessionModule),
  ],
  providers: [EvaluationFormService, EvaluatorAssignmentService],
  controllers: [EvaluationFormController],
  exports: [EvaluationFormService, TypeOrmModule],
})
export class EvaluationFormModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationSession } from './evaluation-session.entity';
import { EvaluationSessionService } from './evaluation-session.service';
import { EvaluationSessionController } from './evaluation-session.controller';
import { EvaluationFormModule } from '../evaluation-form/evaluation-form.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { UserModule } from 'src/user/user.module';
import { EvaluatorAssignmentModule } from '../evaluator-assignment/evaluator-assignment.module';
import { EmailModule } from 'src/email/email.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationSession]),
    forwardRef(() => EvaluationFormModule),
    ProjectsModule,
    UserModule,
    EvaluatorAssignmentModule,
    EmailModule,
    NotificationModule,
  ],
  providers: [EvaluationSessionService],
  controllers: [EvaluationSessionController],
  exports: [EvaluationSessionService, TypeOrmModule],
})
export class EvaluationSessionModule {}

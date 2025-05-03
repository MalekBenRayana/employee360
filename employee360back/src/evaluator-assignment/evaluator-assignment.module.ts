import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatorAssignment } from './evaluator-assignment.entity';
import { EvaluatorAssignmentService } from './evaluator-assignment.service';
import { EvaluatorAssignmentController } from './evaluator-assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluatorAssignment])],
  providers: [EvaluatorAssignmentService],
  controllers: [EvaluatorAssignmentController],
  exports: [EvaluatorAssignmentService, TypeOrmModule],
})
export class EvaluatorAssignmentModule {}

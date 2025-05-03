import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormResponseValue } from './form-response-value.entity';
import { FormResponseValueService } from './form-response-value.service';
import { FormResponseValueController } from './form-response-value.controller';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormResponseValue, EvaluationResponse])],
  controllers: [FormResponseValueController],
  providers: [FormResponseValueService],
  exports: [FormResponseValueService],
})
export class FormResponseValueModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormResponseValue } from './form-response-value.entity';
import { FormResponseValueService } from './form-response-value.service';
import { FormResponseValueController } from './form-response-value.controller';
import { EvaluationResponseModule } from '../evaluation-response/evaluation-response.module'; // Assurez-vous que le chemin d'accès est correct

@Module({
  imports: [
    TypeOrmModule.forFeature([FormResponseValue]),
    forwardRef(() => EvaluationResponseModule), // Utilisez forwardRef ici
  ],
  controllers: [FormResponseValueController],
  providers: [FormResponseValueService],
  exports: [FormResponseValueService],
})
export class FormResponseValueModule {}

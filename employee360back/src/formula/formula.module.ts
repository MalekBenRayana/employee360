import { Module, forwardRef } from '@nestjs/common';
import { FormulaService } from './formula.service';
import { FormulaController } from './formula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formula } from './formula.entity';
import { EvaluationFormModule } from 'src/evaluation-form/evaluation-form.module';
import { PerformancePointTypeModule } from 'src/performance-point-type/performance-point-type.module';
import { EvaluationFormService } from 'src/evaluation-form/evaluation-form.service';
import { PerformancePointTypeService } from 'src/performance-point-type/performance-point-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Formula]),
    forwardRef(() => EvaluationFormModule),
    PerformancePointTypeModule,
  ],
  providers: [
    FormulaService,
    EvaluationFormService,
    PerformancePointTypeService,
  ],
  controllers: [FormulaController],
  exports: [FormulaService],
})
export class FormulaModule {}

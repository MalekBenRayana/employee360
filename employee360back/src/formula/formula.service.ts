import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { EvaluationFormService } from '../evaluation-form/evaluation-form.service';
import { CreateFormulaDto } from './dto/create-formula.dto';
import { UpdateFormulaDto } from './dto/update-formula.dto';
import { Formula } from './formula.entity';

@Injectable()
export class FormulaService {
  constructor(
    @InjectRepository(Formula)
    private readonly formulaRepository: Repository<Formula>,
    private readonly evaluationFormService: EvaluationFormService,
  ) {}

  async create(createFormulaDto: CreateFormulaDto): Promise<Formula> {
    const form = await this.evaluationFormService.getFormById(
      createFormulaDto.formId,
    );
    if (!form) {
      throw new NotFoundException(
        `EvaluationForm with ID "${createFormulaDto.formId}" not found`,
      );
    }

    const formula = this.formulaRepository.create({
      form,
      expression: createFormulaDto.expression,
    });

    try {
      return await this.formulaRepository.save(formula);
    } catch (error) {
      console.error('Erreur lors de la création de la formule:', error);
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Erreur de base de données : vérifiez les données fournies.',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Formula[]> {
    return await this.formulaRepository.find({
      relations: ['form'],
    });
  }

  async findOne(id: number): Promise<Formula> {
    return await this.formulaRepository.findOneOrFail({
      where: { id },
      relations: ['form'],
    });
  }

  async findByForm(formId: number): Promise<Formula[]> {
    return await this.formulaRepository.find({
      where: { form: { id: formId } },
    });
  }

  async update(
    id: number,
    updateFormulaDto: UpdateFormulaDto,
  ): Promise<Formula> {
    const existingFormula = await this.formulaRepository.findOneOrFail({
      where: { id },
    });

    if (updateFormulaDto.formId) {
      const form = await this.evaluationFormService.getFormById(
        updateFormulaDto.formId,
      );
      if (!form) {
        throw new NotFoundException(
          `EvaluationForm with ID "${updateFormulaDto.formId}" not found`,
        );
      }
      existingFormula.form = form;
    }

    if (updateFormulaDto.expression !== undefined) {
      existingFormula.expression = updateFormulaDto.expression;
    }

    try {
      return await this.formulaRepository.save(existingFormula);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formule:', error);
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Erreur de base de données : vérifiez les données fournies.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.formulaRepository.delete(id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la formule', error);
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Erreur de base de données lors de la suppression de la formule.',
        );
      }
      throw error;
    }
  }
}

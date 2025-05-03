import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormResponseValue } from './form-response-value.entity';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

@Injectable()
export class FormResponseValueService {
  constructor(
    @InjectRepository(FormResponseValue)
    private readonly formResponseValueRepository: Repository<FormResponseValue>,
    @InjectRepository(EvaluationResponse)
    private readonly evaluationResponseRepository: Repository<EvaluationResponse>,
  ) {}

  async create(
    formResponseValue: Partial<FormResponseValue>,
  ): Promise<FormResponseValue> {
    const newResponseValue =
      this.formResponseValueRepository.create(formResponseValue);
    return this.formResponseValueRepository.save(newResponseValue);
  }

  async createMultiple(
    responseValues: Partial<FormResponseValue>[],
  ): Promise<FormResponseValue[]> {
    const newResponseValues =
      this.formResponseValueRepository.create(responseValues);
    return this.formResponseValueRepository.save(newResponseValues);
  }

  async createFromFrontend(
    evaluationResponseId: number,
    fieldKey: string,
    fieldValue: string,
  ): Promise<FormResponseValue> {
    const evaluationResponse = await this.evaluationResponseRepository.findOne({
      where: { id: evaluationResponseId },
    });

    if (!evaluationResponse) {
      throw new NotFoundException(
        `EvaluationResponse with ID ${evaluationResponseId} not found`,
      );
    }

    const newResponseValue = this.formResponseValueRepository.create({
      fieldKey,
      fieldValue,
      evaluationResponse: evaluationResponse,
    });

    return this.formResponseValueRepository.save(newResponseValue);
  }

  async findAll(): Promise<FormResponseValue[]> {
    return this.formResponseValueRepository.find();
  }

  async findOne(id: number): Promise<FormResponseValue | undefined> {
    const responseValue = await this.formResponseValueRepository.findOne({
      where: { id },
    });
    return responseValue ? responseValue : undefined;
  }

  async update(
    id: number,
    formResponseValue: Partial<FormResponseValue>,
  ): Promise<FormResponseValue | undefined> {
    await this.formResponseValueRepository.update(id, formResponseValue);
    const updatedResponseValue = await this.formResponseValueRepository.findOne(
      { where: { id } },
    );
    return updatedResponseValue ? updatedResponseValue : undefined;
  }

  async remove(id: number): Promise<void> {
    await this.formResponseValueRepository.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FormResponseValueService } from './form-response-value.service';
import { FormResponseValue } from './form-response-value.entity';
import { EvaluationResponseService } from '../evaluation-response/evaluation-response.service';

@Controller('form-response-values')
export class FormResponseValueController {
  constructor(
    private readonly formResponseValueService: FormResponseValueService,
    private readonly evaluationResponseService: EvaluationResponseService,
  ) {}

  @Post()
  async create(
    @Body()
    createFormResponseValue: {
      evaluationResponseId: number;
      fieldKey: string;
      fieldValue: string;
    },
  ) {
    try {
      const evaluationResponse = await this.evaluationResponseService.findById(
        createFormResponseValue.evaluationResponseId,
      );
      return this.formResponseValueService.create({
        evaluationResponse,
        fieldKey: createFormResponseValue.fieldKey,
        fieldValue: createFormResponseValue.fieldValue,
      });
    } catch (error) {
      console.error('Erreur lors de la création de FormResponseValue :', error);
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.formResponseValueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formResponseValueService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formResponseValueService.remove(+id);
  }
}

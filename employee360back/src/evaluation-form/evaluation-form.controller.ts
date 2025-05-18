import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EvaluationFormService } from './evaluation-form.service';
import { EvaluationForm } from './evaluation-form.entity';
import { EvaluationResponseService } from '../evaluation-response/evaluation-response.service';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

@Controller('evaluation-forms')
export class EvaluationFormController {
  constructor(
    private readonly evaluationFormService: EvaluationFormService,
    private readonly evaluationResponseService: EvaluationResponseService,
  ) {}

  @Post()
  async createForm(@Body() formData: any): Promise<EvaluationForm> {
    try {
      return await this.evaluationFormService.createForm(formData);
    } catch (error) {
      console.error('Erreur lors de la création du formulaire:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du formulaire',
      );
    }
  }

  @Get()
  async getAllForms(): Promise<EvaluationForm[]> {
    try {
      return await this.evaluationFormService.getAllForms();
    } catch (error) {
      console.error(
        'Erreur lors de la récupération de tous les formulaires:',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des formulaires',
      );
    }
  }

  @Get(':id')
  async getFormById(@Param('id') id: number): Promise<EvaluationForm> {
    try {
      const form = await this.evaluationFormService.getFormById(id);
      return form;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du formulaire avec l'ID ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Erreur lors de la récupération du formulaire',
        );
      }
    }
  }

  @Put(':id')
  async updateForm(
    @Param('id') id: number,
    @Body() formData: any,
  ): Promise<EvaluationForm> {
    try {
      return await this.evaluationFormService.updateForm(id, formData);
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du formulaire avec l'ID ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Erreur lors de la mise à jour du formulaire',
        );
      }
    }
  }

  @Delete(':id')
  async deleteForm(@Param('id') id: number): Promise<void> {
    try {
      await this.evaluationFormService.deleteForm(id);
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du formulaire avec l'ID ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Erreur lors de la suppression du formulaire',
        );
      }
    }
  }

  @Get(':formId/responses')
  async getResponsesByForm(
    @Param('formId') formId: number,
  ): Promise<EvaluationResponse[]> {
    try {
      return await this.evaluationResponseService.findByForm(formId);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des réponses pour le formulaire avec l'ID ${formId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des réponses',
      );
    }
  }

  @Get('/respond/:formId')
  async getEvaluationFormForResponse(
    @Param('formId') formId: number,
    @Query('sessionId') sessionId: number,
    @Query('evaluatorId') evaluatorId: number,
  ) {
    console.log('Récupération du formulaire pour répondre :');
    console.log('Form ID:', formId);
    console.log('Session ID:', sessionId);
    console.log('Evaluator ID:', evaluatorId);

    try {
      const formData = await this.evaluationFormService.getFormForResponse(
        +formId,
        +sessionId,
        +evaluatorId,
      );
      return {
        message: 'Formulaire récupéré avec succès',
        formId,
        sessionId,
        evaluatorId,
        evaluateeId: formData.evaluateeId,
        formStructure: formData.form_structure,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du formulaire pour répondre:',
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Erreur lors de la récupération du formulaire',
        );
      }
    }
  }
}

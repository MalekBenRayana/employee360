import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationForm } from './evaluation-form.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { EvaluatorAssignment } from 'src/evaluator-assignment/evaluator-assignment.entity';

@Injectable()
export class EvaluationFormService {
  constructor(
    @InjectRepository(EvaluationForm)
    private readonly evaluationFormRepository: Repository<EvaluationForm>,
    @InjectRepository(EvaluationSession)
    private readonly evaluationSessionRepository: Repository<EvaluationSession>,
    @InjectRepository(EvaluatorAssignment)
    private readonly evaluatorAssignmentRepository: Repository<EvaluatorAssignment>,
  ) {}

  private transformFormStructure(formStructure: any): any {
    if (!formStructure || !formStructure.questions) {
      return formStructure;
    }

    const updatedQuestions = formStructure.questions.map((question) => {
      if (
        (question.type === 'checkbox' || question.type === 'radio') &&
        question.options &&
        Array.isArray(question.options)
      ) {
        const updatedOptions = question.options.map((option, index) => ({
          ...option,
          value: isNaN(Number(option.value)) ? index + 1 : Number(option.value),
        }));
        return { ...question, options: updatedOptions };
      }

      return question;
    });

    return { ...formStructure, questions: updatedQuestions };
  }

  async createForm(formData: Partial<EvaluationForm>): Promise<EvaluationForm> {
    const transformedFormStructure = this.transformFormStructure(
      formData.form_structure,
    );
    const newForm = this.evaluationFormRepository.create({
      ...formData,
      form_structure: transformedFormStructure,
    });
    return this.evaluationFormRepository.save(newForm);
  }

  async getAllForms(): Promise<EvaluationForm[]> {
    return this.evaluationFormRepository.find();
  }

  async getFormById(id: number): Promise<EvaluationForm> {
    const form = await this.evaluationFormRepository.findOne({ where: { id } });
    if (!form) {
      throw new NotFoundException(`Formulaire avec l'ID ${id} non trouvé`);
    }
    return form;
  }

  async updateForm(id: number, formData: any): Promise<EvaluationForm> {
    const form = await this.evaluationFormRepository.findOne({ where: { id } });
    if (!form) {
      throw new NotFoundException(`Formulaire avec l'ID ${id} non trouvé`);
    }
    const transformedFormStructure = this.transformFormStructure(
      formData.form_structure,
    );
    await this.evaluationFormRepository.update(id, {
      ...formData,
      form_structure: transformedFormStructure,
    });
    return this.getFormById(id);
  }

  async deleteForm(id: number): Promise<void> {
    const result = await this.evaluationFormRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Formulaire avec l'ID ${id} non trouvé`);
    }
  }

  async getFormForResponse(
    formId: number,
    sessionId: number,
    evaluatorId: number,
  ): Promise<EvaluationForm & { evaluateeId: number }> {
    const form = await this.evaluationFormRepository.findOne({
      where: { id: formId },
    });
    if (!form) {
      throw new NotFoundException(`Formulaire avec l'ID ${formId} non trouvé`);
    }

    const session = await this.evaluationSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['evaluatee', 'form'],
    });

    if (!session || !session.evaluatee) {
      throw new NotFoundException(
        `Session avec l'ID ${sessionId} non trouvée ou l'évalué n'est pas associé.`,
      );
    }

    const evaluateeId = session.evaluatee.id;

    const isSelfEvaluation = evaluatorId === evaluateeId;
    let assignment;

    if (!isSelfEvaluation) {
      assignment = await this.evaluatorAssignmentRepository.findOne({
        where: {
          evaluationSession: { id: sessionId },
          evaluator: { id: evaluatorId },
        },
        relations: ['evaluationSession', 'evaluator', 'evaluationSession.form'],
      });

      if (!assignment) {
        throw new NotFoundException(
          `L'évaluateur avec l'ID ${evaluatorId} n'est pas assigné à la session d'évaluation avec l'ID ${sessionId} pour ce formulaire.`,
        );
      }

      if (assignment.evaluationSession?.form?.id !== formId) {
        throw new NotFoundException(
          `La session d'évaluation avec l'ID ${sessionId} n'est pas associée au formulaire avec l'ID ${formId}.`,
        );
      }
    } else {
      if (session.form?.id !== formId) {
        throw new NotFoundException(
          `La session d'évaluation avec l'ID ${sessionId} n'est pas associée au formulaire avec l'ID ${formId}.`,
        );
      }
    }

    return { ...form, evaluateeId };
  }
}

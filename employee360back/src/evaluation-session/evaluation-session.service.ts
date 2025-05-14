import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { EvaluationSession } from './evaluation-session.entity';
import { EvaluationForm } from '../evaluation-form/evaluation-form.entity';
import { User } from '../user/user.entity';
import { Project } from '../projects/project.entity';
import { EvaluatorAssignment } from '../evaluator-assignment/evaluator-assignment.entity';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service'; // Importez le service de notification

@Injectable()
export class EvaluationSessionService {
  constructor(
    @InjectRepository(EvaluationSession)
    private readonly evaluationSessionRepo: Repository<EvaluationSession>,

    @InjectRepository(EvaluationForm)
    private readonly evaluationFormRepo: Repository<EvaluationForm>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(EvaluatorAssignment)
    private readonly evaluatorAssignmentRepo: Repository<EvaluatorAssignment>,

    private readonly emailService: EmailService,
    @Inject(NotificationService) // Injectez le service de notification
    private readonly notificationService: NotificationService,
  ) {}

  async startSession(id: number): Promise<EvaluationSession> {
    const session = await this.findOne(id);
    session.status = 'active';
    session.startDate = new Date();
    return this.evaluationSessionRepo.save(session);
  }

  async closeSession(id: number): Promise<EvaluationSession> {
    const session = await this.findOne(id);
    session.status = 'closed';
    session.endDate = new Date();
    return this.evaluationSessionRepo.save(session);
  }

  async create(
    sessionData: any,
  ): Promise<{ sessionId: number; session: EvaluationSession }> {
    const project = await this.projectRepo.findOne({
      where: { project_id: sessionData.projectId },
      relations: ['users'],
    });

    const user = await this.userRepo.findOne({
      where: { id: sessionData.userId },
    });
    const evaluateeUser = await this.userRepo.findOne({
      where: { id: sessionData.evaluateeId },
    });
    const form = await this.evaluationFormRepo.findOne({
      where: { id: sessionData.formId },
    });

    if (!form || !user || !project || !evaluateeUser) {
      throw new NotFoundException(
        'Form, User, Project, or Evaluatee User not found',
      );
    }

    const session: EvaluationSession = this.evaluationSessionRepo.create({
      form,
      user,
      project,
      status: sessionData.status ?? 'pending',
      startDate: sessionData.startDate,
      duration: sessionData.duration,
      evaluatee: evaluateeUser,
      evaluateeId: evaluateeUser.id,
    } as DeepPartial<EvaluationSession>);

    session.setEndDate?.();
    const savedSession = await this.evaluationSessionRepo.save(session);

    const evaluators = project.users.filter(
      (projectUser) => projectUser.id !== evaluateeUser.id,
    );
    for (const evaluator of evaluators) {
      const assignment = this.evaluatorAssignmentRepo.create({
        evaluationSession: savedSession,
        evaluator,
      });
      await this.evaluatorAssignmentRepo.save(assignment);

      const evaluationLink = `http://localhost:3001/respond/${session.form.id}?sessionId=${savedSession.id}&evaluatorId=${evaluator.id}`;
      const emailSubject = `Nouvelle Évaluation pour ${evaluateeUser.username} - Projet ${project.project_name}`;
      const emailText = `Bonjour ${evaluator.username},\n\nVous avez été désigné pour évaluer ${evaluateeUser.username} sur le projet "${project.project_name}" via le formulaire "${form.name}".\n\nLien : ${evaluationLink}\n\nMerci de remplir l’évaluation dès que possible.\n\nCordialement,\nL’équipe d’évaluation.`;
      const emailHtml = `
        <p>Bonjour ${evaluator.username},</p>
        <p>Vous avez été désigné pour évaluer la performance de <strong>${evaluateeUser.username}</strong> sur le projet "<strong>${project.project_name}</strong>" en utilisant le formulaire "<strong>${form.name}</strong>".</p>
        <p>Veuillez cliquer sur le lien suivant pour accéder au formulaire :</p>
        <p><a href="${evaluationLink}">${evaluationLink}</a></p>
        <p>Merci de compléter cette évaluation dans les plus brefs délais.</p>
        <p>Cordialement,<br/>L’équipe d’évaluation</p>
      `;

      try {
        await this.emailService.sendEmail(
          evaluator.email,
          emailSubject,
          emailText,
          emailHtml,
        );
        console.log(`E-mail envoyé à ${evaluator.email}`);
      } catch (error) {
        console.error(
          `Erreur d’envoi de l’e-mail à ${evaluator.email}:`,
          error,
        );
      }

      // Envoyer la notification
      const notificationMessage = `Nouvelle évaluation disponible pour ${evaluateeUser.username} sur le projet "${project.project_name}".`;
      await this.notificationService.notifyUser(evaluator.id, notificationMessage);
    }

    return { sessionId: savedSession.id, session: savedSession };
  }
  async assignEvaluatorsAndSendEmails(
    sessionId: number,
    evaluatorIds: number[],
  ): Promise<void> {
    const session = await this.evaluationSessionRepo.findOne({
      where: { id: sessionId },
      relations: ['form', 'user', 'project', 'evaluatee'],
    });

    if (!session) {
      throw new NotFoundException(
        `Evaluation session with id ${sessionId} not found`,
      );
    }

    for (const evaluatorId of evaluatorIds) {
      const evaluator = await this.userRepo.findOne({
        where: { id: evaluatorId },
      });

      if (evaluator) {
        const assignment = this.evaluatorAssignmentRepo.create({
          evaluationSession: session,
          evaluator,
        });
        await this.evaluatorAssignmentRepo.save(assignment);

        const evaluationLink = `http://localhost:3001/respond/${session.form.id}?sessionId=${sessionId}&evaluatorId=${evaluatorId}`;
        const emailSubject = `Nouvelle Évaluation pour ${session.evaluatee.username} - Projet ${session.project.project_name}`;
        const emailText = `Bonjour ${evaluator.username},\n\nVous avez été désigné pour évaluer ${session.evaluatee.username} sur le projet "${session.project.project_name}" via le formulaire "${session.form.name}".\n\nLien : ${evaluationLink}\n\nMerci de remplir l’évaluation dès que possible.\n\nCordialement,\nL’équipe d’évaluation.`;
        const emailHtml = `
          <p>Bonjour ${evaluator.username},</p>
          <p>Vous avez été désigné pour évaluer la performance de <strong>${session.evaluatee.username}</strong> sur le projet "<strong>${session.project.project_name}</strong>" en utilisant le formulaire "<strong>${session.form.name}</strong>".</p>
          <p>Veuillez cliquer sur le lien suivant pour accéder au formulaire :</p>
          <p><a href="${evaluationLink}">${evaluationLink}</a></p>
          <p>Merci de compléter cette évaluation dans les plus brefs délais.</p>
          <p>Cordialement,<br/>L’équipe d’évaluation</p>
        `;

        try {
          await this.emailService.sendEmail(
            evaluator.email,
            emailSubject,
            emailText,
            emailHtml,
          );
          console.log(`E-mail envoyé à ${evaluator.email}`);
        } catch (error) {
          console.error(
            `Erreur d’envoi de l’e-mail à ${evaluator.email}:`,
            error,
          );
        }

        const notificationMessage = `Nouvelle évaluation disponible pour ${session.evaluatee.username} sur le projet "${session.project.project_name}".`;
        await this.notificationService.notifyUser(evaluatorId, notificationMessage);
      }
    }
  }

  async assignEvaluators(
    sessionId: number,
    evaluatorIds: number[],
  ): Promise<void> {
    const session = await this.evaluationSessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Evaluation session with id ${sessionId} not found`,
      );
    }

    for (const evaluatorId of evaluatorIds) {
      const evaluator = await this.userRepo.findOne({
        where: { id: evaluatorId },
      });

      if (evaluator) {
        const assignment = this.evaluatorAssignmentRepo.create({
          evaluationSession: session,
          evaluator,
        });
        await this.evaluatorAssignmentRepo.save(assignment);
      }
    }
  }

  async findOne(id: number): Promise<EvaluationSession> {
    const session = await this.evaluationSessionRepo.findOne({
      where: { id },
      relations: [
        'form',
        'evaluatee',
        'project',
        'evaluatorAssignments',
        'evaluatorAssignments.evaluator',
        'evaluatee',
      ],
    });

    if (!session) {
      throw new NotFoundException(`Evaluation session with id ${id} not found`);
    }

    return session;
  }

  async findAll(): Promise<EvaluationSession[]> {
    return this.evaluationSessionRepo.find({
      relations: [
        'form',
        'evaluatee',
        'project',
        'evaluatorAssignments',
        'evaluatorAssignments.evaluator',
        'evaluatee',
      ],
    });
  }

  async updateStatus(id: number, status: string): Promise<EvaluationSession> {
    const session = await this.findOne(id);
    session.status = status;
    return this.evaluationSessionRepo.save(session);
  }

  async deleteSession(id: number): Promise<void> {
    await this.evaluationSessionRepo.delete(id);
  }
}
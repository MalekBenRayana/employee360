import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../user/user.entity';

import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';

import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';

import { Project } from 'src/projects/project.entity';

import { AiEvaluationReport } from 'src/ai-evaluation-report/ai-evaluation-report.entity';

import { PerformancePointType } from 'src/performance-point-type/performance-point-type.entity';

import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';



@Injectable()

export class TeamAiReportService {

  private readonly logger = new Logger(TeamAiReportService.name);



  constructor(

    @InjectRepository(User)

    private readonly userRepository: Repository<User>,

    @InjectRepository(Project)

    private readonly projectRepository: Repository<Project>,

    @InjectRepository(AiEvaluationReport)

    private readonly aiReportRepository: Repository<AiEvaluationReport>,

    @InjectRepository(PerformancePointType)

    private readonly performancePointTypeRepository: Repository<PerformancePointType>,

    @InjectRepository(PerformancePointChange)

    private readonly performancePointChangeRepository: Repository<PerformancePointChange>,

    @InjectRepository(EvaluationSession)

    private readonly evaluationSessionRepository: Repository<EvaluationSession>,

    @InjectRepository(EvaluationResponse)

    private readonly evaluationResponseRepository: Repository<EvaluationResponse>,

  ) {}



  async getGlobalTeamAiReportForProject(

    managerId: number,

    projectId: number,

  ): Promise<

    {

      employeeId: number;

      username: string;

      email: string;

      aiReportSummary: string | null; // L'ancien champ, peut être gardé si toujours utile

      aiReportFullContent: any | null; // <-- NOUVEAU : pour le rapport IA complet

      averageScore: number | null;

      numberOfEvaluations: number;

      totalPerformancePoints: number;

      projectAverageScore: number | null;

      projectAveragePerformancePointScore: number | null;

      averageScoresByPerformancePoint: {

        [pointName: string]: number | null;

      };

      teamAverageScoresByPerformancePoint: {

        [pointName: string]: number | null;

      };

    }[]

  > {

    this.logger.log(

      `Generating global AI report for manager ID: ${managerId}, project ID: ${projectId}`,

    );



    const manager = await this.userRepository

      .createQueryBuilder('user')

      .leftJoin('user.roles', 'role')

      .where('user.id = :managerId', { managerId })

      .andWhere('role.name = :managerRole', { managerRole: 'manager' })

      .getOne();



    if (!manager) {

      throw new NotFoundException(

        `Manager with ID ${managerId} not found or does not have the manager role.`,

      );

    }



    const project = await this.projectRepository.findOne({

      where: { project_id: projectId },

    });

    if (!project) {

      throw new NotFoundException(`Projet avec l'ID ${projectId} non trouvé.`);

    }



    const projectEmployees = await this.userRepository

      .createQueryBuilder('user')

      .innerJoin('user.projects', 'project')

      .where('project.project_id = :projectId', { projectId })

      .select(['user.id', 'user.username', 'user.email'])

      .getMany();



    if (!projectEmployees || projectEmployees.length === 0) {

      this.logger.warn(`No employees found for project ID: ${projectId}`);

      return [];

    }



    const performancePointTypes =

      await this.performancePointTypeRepository.find();



    const teamAverageScoresByPerformancePoint: {

      [pointName: string]: number | null;

    } = {};

    for (const pointType of performancePointTypes) {

      const avgScoreResult = await this.performancePointChangeRepository

        .createQueryBuilder('ppc')

        .leftJoin('ppc.responseValue', 'rv')

        .leftJoin('rv.evaluationResponse', 'er')

        .leftJoin('er.session', 'es')

        .where('es.projectId = :projectId', { projectId })

        .andWhere('ppc.pointType.id = :pointTypeId', {

          pointTypeId: pointType.id,

        })

        .select('AVG(ppc.score)', 'avgScore')

        .getRawOne();

      teamAverageScoresByPerformancePoint[pointType.name] = avgScoreResult.avgScore

        ? parseFloat(avgScoreResult.avgScore)

        : null;

    }



    const teamGlobalReport = await Promise.all(

      projectEmployees.map(async (employee) => {

        const latestAiReportResult = await this.aiReportRepository

          .createQueryBuilder('aiReport')

          .leftJoin('aiReport.evaluationResponse', 'evalResponse')

          .leftJoin('evalResponse.session', 'session')

          .where('aiReport.evaluateeId = :employeeId', {

            employeeId: employee.id,

          })

          .andWhere('session.projectId = :projectId', { projectId })

          .orderBy('aiReport.createdAt', 'DESC')

          .select(['aiReport.overallSummary', 'aiReport.reportContent']) // <-- MODIFIÉ ici pour sélectionner reportContent

          .getOne();



        const aiReportSummary = latestAiReportResult?.overallSummary || null;

        const aiReportFullContent = latestAiReportResult?.reportContent || null; // <-- NOUVEAU



        const averageScoreResult = await this.evaluationResponseRepository

          .createQueryBuilder('response')

          .leftJoin('response.session', 'session')

          .where('session.evaluatee.id = :employeeId', {

            employeeId: employee.id,

          })

          .andWhere('session.projectId = :projectId', { projectId })

          .select('AVG(response.score)', 'average')

          .getRawOne();

        const averageScore = averageScoreResult.average

          ? parseFloat(averageScoreResult.average)

          : null;



        const numberOfEvaluations =

          await this.evaluationSessionRepository.count({

            where: {

              evaluatee: { id: employee.id },

              projectId: projectId,

              status: 'completed',

            },

          });



        const totalPerformancePointsResult =

          await this.performancePointChangeRepository

            .createQueryBuilder('ppc')

            .leftJoin('ppc.responseValue', 'rv')

            .leftJoin('rv.evaluationResponse', 'er')

            .leftJoin('er.session', 'es')

            .where('es.evaluatee.id = :employeeId', { employeeId: employee.id })

            .andWhere('es.projectId = :projectId', { projectId })

            .select('SUM(ppc.score)', 'totalPoints')

            .getRawOne();

        const totalPerformancePoints = totalPerformancePointsResult.totalPoints

          ? parseInt(totalPerformancePointsResult.totalPoints, 10)

          : 0;



        const averageScoresByPerformancePoint: {

          [pointName: string]: number | null;

        } = {};

        for (const pointType of performancePointTypes) {

          const avgScoreResult = await this.performancePointChangeRepository

            .createQueryBuilder('ppc')

            .leftJoin('ppc.responseValue', 'rv')

            .leftJoin('rv.evaluationResponse', 'er')

            .leftJoin('er.session', 'es')

            .where('es.evaluatee.id = :employeeId', { employeeId: employee.id })

            .andWhere('es.projectId = :projectId', { projectId })

            .andWhere('ppc.pointType.id = :pointTypeId', {

              pointTypeId: pointType.id,

            })

            .select('AVG(ppc.score)', 'avgScore')

            .getRawOne();

          averageScoresByPerformancePoint[pointType.name] =

            avgScoreResult.avgScore

              ? parseFloat(avgScoreResult.avgScore)

              : null;

        }



        const projectAverageScoreResult =

          await this.evaluationResponseRepository

            .createQueryBuilder('response')

            .leftJoin('response.session', 'session')

            .where('session.evaluatee.id = :employeeId', {

              employeeId: employee.id,

            })

            .andWhere('session.projectId = :projectId', { projectId })

            .select('AVG(response.score)', 'average')

            .getRawOne();

        const projectAverageScore = projectAverageScoreResult.average

          ? parseFloat(projectAverageScoreResult.average)

          : null;



        const projectAveragePerformancePointScoreResult =

          await this.performancePointChangeRepository

            .createQueryBuilder('ppc')

            .leftJoin('ppc.responseValue', 'rv')

            .leftJoin('rv.evaluationResponse', 'er')

            .leftJoin('er.session', 'es')

            .where('es.evaluatee.id = :employeeId', { employeeId: employee.id })

            .andWhere('es.projectId = :projectId')

            .select('AVG(ppc.score)', 'averagePoints')

            .setParameters({ projectId: projectId })

            .getRawOne();

        const projectAveragePerformancePointScore =

          projectAveragePerformancePointScoreResult.averagePoints

            ? parseFloat(

                projectAveragePerformancePointScoreResult.averagePoints,

              )

            : null;



        return {

          employeeId: employee.id,

          username: employee.username,

          email: employee.email,

          aiReportSummary,

          aiReportFullContent, // <-- AJOUTÉ

          averageScore,

          numberOfEvaluations,

          totalPerformancePoints,

          projectAverageScore,

          projectAveragePerformancePointScore,

          averageScoresByPerformancePoint,

          teamAverageScoresByPerformancePoint,

        };

      }),

    );



    return teamGlobalReport;

  }

}
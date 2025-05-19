import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  IsNull,
  In,
  LessThan,
  Raw,
  ILike,
  FindOptionsOrder,
} from 'typeorm';
import { User } from '../user/user.entity';
import { PerformancePointType } from '../performance-point-type/performance-point-type.entity';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { EvaluationResponse } from 'src/evaluation-response/evaluation-response.entity';
import { Project } from 'src/projects/project.entity';
@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PerformancePointType)
    private readonly performancePointTypeRepository: Repository<PerformancePointType>,
    @InjectRepository(EmployeePointPeriodAggregate)
    private readonly employeePointPeriodAggregateRepository: Repository<EmployeePointPeriodAggregate>,
    @InjectRepository(EvaluationSession)
    private readonly evaluationSessionRepository: Repository<EvaluationSession>,
    @InjectRepository(PerformancePointChange)
    private readonly performancePointChangeRepository: Repository<PerformancePointChange>,
    @InjectRepository(EvaluationResponse)
    private readonly evaluationResponseRepository: Repository<EvaluationResponse>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getTotalEmployees(): Promise<number> {
    return this.userRepository.count({});
  }

  async getTotalPerformancePointTypes(): Promise<number> {
    return this.performancePointTypeRepository.count();
  }

  async getTotalEvaluations(): Promise<number> {
    return this.evaluationResponseRepository.count();
  }

  async getEvaluationsCurrentPeriod(): Promise<number> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const result = await this.employeePointPeriodAggregateRepository
      .createQueryBuilder('aggregate')
      .where('aggregate.period = :currentPeriod', { currentPeriod })
      .select('SUM(aggregate.numberOfEvaluations)', 'total')
      .getRawOne();
    return parseInt(result.total || '0', 10);
  }

  async getAverageOverallScoreCurrentPeriod(): Promise<number> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const aggregates = await this.employeePointPeriodAggregateRepository.find({
      where: { period: currentPeriod, averageScore: Not(IsNull()) },
    });

    if (aggregates.length === 0) {
      return 0;
    }

    const sumOfAverages = aggregates.reduce(
      (sum, agg) => sum + (agg.averageScore !== null ? agg.averageScore : 0),
      0,
    );
    return parseFloat((sumOfAverages / aggregates.length).toFixed(2));
  }

  async getAverageScoresByPerformancePointCurrentPeriod(): Promise<{
    [key: string]: number;
  }> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const aggregates = await this.employeePointPeriodAggregateRepository.find({
      where: { period: currentPeriod, averageScore: Not(IsNull()) },
      relations: ['pointType'],
    });

    const averageScores: { [pointTypeName: string]: number } = {};
    const sums: { [pointTypeName: string]: number } = {};
    const counts: { [pointTypeName: string]: number } = {};

    aggregates.forEach((aggregate) => {
      if (aggregate.pointType && aggregate.averageScore !== null) {
        const pointTypeName = aggregate.pointType.name;
        sums[pointTypeName] =
          (sums[pointTypeName] || 0) + aggregate.averageScore;
        counts[pointTypeName] = (counts[pointTypeName] || 0) + 1;
      }
    });

    for (const pointTypeName in sums) {
      averageScores[pointTypeName] = parseFloat(
        (sums[pointTypeName] / counts[pointTypeName]).toFixed(2),
      );
    }

    return averageScores;
  }

  async getEmployeesWithoutEvaluationCurrentPeriod(): Promise<number> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const employeesWithEvaluation =
      await this.employeePointPeriodAggregateRepository
        .createQueryBuilder('aggregate')
        .select('DISTINCT aggregate.evaluateeId', 'employeeId')
        .where('aggregate.period = :currentPeriod', { currentPeriod })
        .getRawMany()
        .then((results) => results.map((r) => r.employeeId));

    return this.userRepository.count({
      where: {
        id: Not(
          In(
            employeesWithEvaluation.length > 0 ? employeesWithEvaluation : [-1],
          ),
        ),
      },
    });
  }

  async getAverageOverallScoreTrend(
    numberOfPeriods: number,
  ): Promise<{ period: string; averageScore: number }[]> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const [currentYear, currentQ] = currentPeriod.split('-Q').map(Number);
    const periods: string[] = [];

    let year = currentYear;
    let quarter = currentQ;

    for (let i = 0; i < numberOfPeriods; i++) {
      periods.push(`${year}-Q${quarter}`);

      quarter--;
      if (quarter <= 0) {
        year--;
        quarter = 4;
      }
    }

    const trendData = await Promise.all(
      periods.map(async (period) => {
        const aggregates =
          await this.employeePointPeriodAggregateRepository.find({
            where: { period: period, averageScore: Not(IsNull()) },
          });
        const averageScore =
          aggregates.length > 0
            ? parseFloat(
                (
                  aggregates.reduce(
                    (sum, agg) =>
                      sum + (agg.averageScore !== null ? agg.averageScore : 0),
                    0,
                  ) / aggregates.length
                ).toFixed(2),
              )
            : 0;
        return { period, averageScore };
      }),
    );

    return trendData.sort((a, b) => a.period.localeCompare(b.period));
  }
  async getEvaluationsTrend(
    numberOfPeriods: number,
  ): Promise<{ period: string; numberOfEvaluations: number }[]> {
    const periods = await this.employeePointPeriodAggregateRepository
      .createQueryBuilder('aggregate')
      .select('DISTINCT aggregate.period', 'period')
      .orderBy('aggregate.period', 'DESC')
      .limit(numberOfPeriods)
      .getRawMany()
      .then((results) => results.map((r) => r.period));

    const trendData = await Promise.all(
      periods.map(async (period) => {
        const result = await this.employeePointPeriodAggregateRepository
          .createQueryBuilder('aggregate')
          .where('aggregate.period = :period', { period })
          .select('SUM(aggregate.numberOfEvaluations)', 'total')
          .getRawOne();
        return {
          period,
          numberOfEvaluations: parseInt(result.total || '0', 10),
        };
      }),
    );

    return trendData.sort((a, b) => a.period.localeCompare(b.period));
  }

  async getEmployeeScoreDistributionCurrentPeriod(): Promise<
    { range: string; count: number }[]
  > {
    const currentPeriod = this.getCurrentPeriodIdentifier();

    const employeeAverages = await this.employeePointPeriodAggregateRepository
      .createQueryBuilder('aggregate')
      .select('aggregate.evaluateeId', 'employeeId')
      .addSelect('AVG(aggregate.averageScore)', 'averageScore')
      .where('aggregate.period = :currentPeriod', { currentPeriod })
      .groupBy('aggregate.evaluateeId')
      .getRawMany();

    const distribution = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0,
    };

    employeeAverages.forEach((empAvg) => {
      const score = parseFloat(empAvg.averageScore || '0');
      if (score >= 0 && score < 2) distribution['0-2']++;
      else if (score >= 2 && score < 4) distribution['2-4']++;
      else if (score >= 4 && score < 6) distribution['4-6']++;
      else if (score >= 6 && score < 8) distribution['6-8']++;
      else if (score >= 8 && score <= 10) distribution['8-10']++;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
    }));
  }

  async getPerformancePointScoreTrend(numberOfPeriods: number): Promise<
    {
      pointTypeName: string;
      trend: { period: string; averageScore: number }[];
    }[]
  > {
    const pointTypes = await this.performancePointTypeRepository.find();
    const allTrends = await Promise.all(
      pointTypes.map(async (pointType) => {
        const periods = await this.employeePointPeriodAggregateRepository
          .createQueryBuilder('aggregate')
          .select('DISTINCT aggregate.period', 'period')
          .orderBy('aggregate.period', 'DESC')
          .limit(numberOfPeriods)
          .getRawMany()
          .then((results) => results.map((r) => r.period));

        const trendData = await Promise.all(
          periods.map(async (period) => {
            const aggregates =
              await this.employeePointPeriodAggregateRepository.find({
                where: {
                  period: period,
                  averageScore: Not(IsNull()),
                  pointType: { id: pointType.id },
                },
                relations: ['pointType'],
              });
            const averageScore =
              aggregates.length > 0
                ? parseFloat(
                    (
                      aggregates.reduce(
                        (sum, agg) =>
                          sum +
                          (agg.averageScore !== null ? agg.averageScore : 0),
                        0,
                      ) / aggregates.length
                    ).toFixed(2),
                  )
                : 0;
            return { period, averageScore };
          }),
        );
        return {
          pointTypeName: pointType.name,
          trend: trendData.sort((a, b) => a.period.localeCompare(b.period)),
        };
      }),
    );
    return allTrends;
  }

  async getEvaluationsInProgress(): Promise<number> {
    if (!this.evaluationSessionRepository) {
      this.logger.warn(
        'EvaluationSessionRepository is not available.  Cannot get evaluations in progress.',
      );
      return 0;
    }
    return this.evaluationSessionRepository.count({
      where: { status: 'IN_PROGRESS' },
    });
  }

  private getCurrentPeriodIdentifier(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let quarter: number;

    if (month >= 1 && month <= 3) {
      quarter = 1;
    } else if (month >= 4 && month <= 6) {
      quarter = 2;
    } else if (month >= 7 && month <= 9) {
      quarter = 3;
    } else {
      quarter = 4;
    }

    return `${year}-Q${quarter}`;
  }

  async getPerformancePointParticipationRate(): Promise<
    { pointTypeName: string; participationRate: number }[]
  > {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const totalEvaluationsInPeriod =
      await this.employeePointPeriodAggregateRepository
        .createQueryBuilder('aggregate')
        .where('aggregate.period = :currentPeriod', { currentPeriod })
        .select('SUM(aggregate.numberOfEvaluations)', 'total')
        .getRawOne()
        .then((result) => parseInt(result.total || '0', 10));

    if (totalEvaluationsInPeriod === 0) {
      return [];
    }

    const pointTypes = await this.performancePointTypeRepository.find();

    const participationRates = await Promise.all(
      pointTypes.map(async (pointType) => {
        const evaluationsWithPoint =
          await this.employeePointPeriodAggregateRepository.count({
            where: { period: currentPeriod, pointType: { id: pointType.id } },
          });
        const participationRate =
          (evaluationsWithPoint / totalEvaluationsInPeriod) * 100;
        return {
          pointTypeName: pointType.name,
          participationRate: parseFloat(participationRate.toFixed(2)),
        };
      }),
    );
    return participationRates;
  }

  async getEvaluationCompletionRateCurrentPeriod(): Promise<number> {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const totalEmployeesInPeriod = await this.userRepository.count({});
    const completedEvaluations =
      await this.employeePointPeriodAggregateRepository.count({
        where: { period: currentPeriod, numberOfEvaluations: Not(IsNull()) },
      });

    if (totalEmployeesInPeriod === 0) {
      return 0;
    }
    return parseFloat(
      ((completedEvaluations / totalEmployeesInPeriod) * 100).toFixed(2),
    );
  }

  async getEvaluationsLateCurrentPeriod(): Promise<number> {
    if (!this.evaluationSessionRepository) return 0;
    const currentPeriod = this.getCurrentPeriodIdentifier();
    const [year, quarter] = currentPeriod.split('-Q');
    let startMonth: string = '01';
    let endMonth: string = '03';

    if (quarter === '1') {
      startMonth = '01';
      endMonth = '03';
    } else if (quarter === '2') {
      startMonth = '04';
      endMonth = '06';
    } else if (quarter === '3') {
      startMonth = '07';
      endMonth = '09';
    } else if (quarter === '4') {
      startMonth = '10';
      endMonth = '12';
    }

    return this.evaluationSessionRepository.count({
      where: {
        endDate: LessThan(new Date()),
        status: Not('COMPLETED'),
        startDate: Raw(
          (alias) => `TO_CHAR(${alias}, 'YYYY-MM') BETWEEN :start AND :end`,
          {
            start: `<span class="math-inline">\{year\}\-</span>{startMonth}`,
            end: `<span class="math-inline">\{year\}\-</span>{endMonth}`,
          },
        ),
      },
    });
  }
  async getAverageCompletionTimeCurrentPeriod(): Promise<string> {
    if (!this.evaluationSessionRepository) return 'N/A';

    const currentPeriodStart = new Date(
      this.getCurrentPeriodIdentifier() + '-01',
    );
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);

    const sessions = await this.evaluationSessionRepository.find({
      where: {
        endDate: Not(IsNull()),
        startDate: Raw(
          (alias) => `TO_CHAR(${alias}, 'YYYY-MM') BETWEEN :start AND :end`,
          {
            start: `<span class="math-inline">\{currentPeriodStart\.getFullYear\(\)\}\-</span>{(currentPeriodStart.getMonth() + 1).toString().padStart(2, '0')}`,
            end: `<span class="math-inline">\{currentPeriodEnd\.getFullYear\(\)\}\-</span>{(currentPeriodEnd.getMonth() + 1).toString().padStart(2, '0')}`,
          },
        ),
      },
    });

    if (sessions.length === 0) {
      return 'N/A';
    }

    let totalDurationSeconds = 0;
    for (const session of sessions) {
      if (session.startDate && session.endDate) {
        totalDurationSeconds +=
          (session.endDate.getTime() - session.startDate.getTime()) / 1000;
      }
    }

    const averageSeconds = totalDurationSeconds / sessions.length;

    if (isNaN(averageSeconds) || averageSeconds === 0) {
      return 'N/A';
    }

    const days = Math.floor(averageSeconds / (3600 * 24));
    const hours = Math.floor((averageSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((averageSeconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  }

  async searchEmployees(query: string): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { email: ILike(`%${query}%`) },
        { username: ILike(`%${query}%`) },
      ],
      take: 10,
    });
  }

  async getEmployeeHistory(employeeId: number): Promise<{
    evaluations: any[];
    performancePoints: any[];
    aggregateScores: any[];
    employee: any;
  }> {
    const employee = await this.userRepository.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employé avec l'ID ${employeeId} non trouvé`);
    }

    const evaluations =
      (await this.evaluationSessionRepository?.find({
        where: { evaluatee: { id: employeeId } },
        relations: [
          'evaluatee',
          'evaluatorAssignments',
          'evaluatorAssignments.evaluator',
        ],
        order: { startDate: 'DESC' },
      })) || [];

    const performancePoints =
      (await this.performancePointChangeRepository?.find({
        where: {
          responseValue: {
            evaluationResponse: { evaluatee: { id: employeeId } },
          },
        },
        relations: [
          'responseValue',
          'responseValue.evaluationResponse',
          'responseValue.evaluationResponse.evaluatee',
          'pointType',
        ],
        order: {
          responseValue: { evaluationResponse: { submittedAt: 'DESC' } },
        } as any,
      })) || [];

    const aggregateScores =
      (await this.employeePointPeriodAggregateRepository?.find({
        where: { evaluatee: { id: employeeId } },
        relations: ['evaluatee', 'pointType'],
        order: { period: 'DESC' },
      })) || [];

    return {
      evaluations,
      performancePoints,
      aggregateScores,
      employee,
    };
  }

  async getAllEmployees(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getScorePerProjectByUser(evaluateeId: number) {
    const rawScores = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.evaluationSessionsAsEvaluatee', 'evaluationSession')
      .leftJoin('evaluationSession.project', 'project')
      .leftJoin('evaluationSession.responses', 'evaluationResponse')
      .select([
        'user.id',
        'user.username',
        'project.project_id',
        'project.project_name',
        'AVG(evaluationResponse.score) AS average_score',
      ])
      .where('user.id = :evaluateeId', { evaluateeId })
      .groupBy('project.project_id')
      .addGroupBy('user.id')
      .addGroupBy('project.project_name')
      .getRawMany();

    const scoresByProject: {
      [projectId: number]: { projectName: string; averageScore: number | null };
    } = {};

    rawScores.forEach((result) => {
      const projectId = result.project_project_id;
      const projectName = result.project_project_name;
      const averageScore = result.average_score;

      if (!scoresByProject[projectId]) {
        scoresByProject[projectId] = { projectName, averageScore: null };
      }

      if (averageScore !== null) {
        scoresByProject[projectId].averageScore = parseFloat(
          averageScore.toFixed(2),
        );
      }
    });

    return Object.values(scoresByProject);
  }

  async getEmployeePerformancePoints(
    employeeId: number,
  ): Promise<PerformancePointChange[]> {
    const employee = await this.userRepository.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employé avec l'ID ${employeeId} non trouvé`);
    }

    return this.performancePointChangeRepository.find({
      where: {
        responseValue: {
          evaluationResponse: { evaluatee: { id: employeeId } },
        },
      },
      relations: [
        'responseValue',
        'responseValue.evaluationResponse',
        'responseValue.evaluationResponse.evaluatee',
        'pointType',
      ],
      order: {
        responseValue: { evaluationResponse: { submittedAt: 'DESC' } },
      } as any,
    });
  }

  async getScoresByPerformancePointAndProjectForEmployee(
    evaluateeId: number,
  ): Promise<
    {
      projectId: number;
      projectName: string;
      performancePointName: string;
      score: number | null;
    }[]
  > {
    const rawScores = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.evaluationSessionsAsEvaluatee', 'evaluationSession')
      .leftJoin('evaluationSession.project', 'project')
      .leftJoin('evaluationSession.responses', 'evaluationResponse')
      .leftJoin('evaluationResponse.responseValues', 'formResponseValue')
      .leftJoin(
        'formResponseValue.performancePointChanges',
        'performancePointChange',
      )
      .leftJoin('performancePointChange.pointType', 'performancePointType')
      .select([
        'project.project_id AS projectId',
        'project.project_name AS projectName',
        'performancePointType.name AS performancePointName',
        'performancePointChange.score AS score',
      ])
      .where('user.id = :evaluateeId', { evaluateeId })
      .orderBy('projectId')
      .addOrderBy('performancePointName')
      .getRawMany();

    return rawScores.map((rawScore) => ({
      projectId: rawScore.projectid,
      projectName: rawScore.projectname,
      performancePointName: rawScore.performancepointname,
      score:
        rawScore.score !== null && rawScore.score !== undefined
          ? parseFloat(rawScore.score)
          : null,
    }));
  }

  async getTeamEmployeeStatsForProject(
    managerId: number | undefined,
    projectId: number,
  ): Promise<
    {
      employeeId: number;
      username: string;
      email: string;
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
    // 1. Récupérer le manager et vérifier
    const manager = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('user.id = :managerId', { managerId })
      .andWhere('role.name = :managerRole', { managerRole: 'manager' })
      .getOne();

    if (!manager) {
      throw new NotFoundException(
        `Manager avec l'ID ${managerId} non trouvé ou n'a pas le rôle de manager.`,
      );
    }

    // 2. Récupérer le projet et vérifier
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} non trouvé.`);
    }

    // 3. Récupérer les employés assignés au projet
    const projectEmployees = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.projects', 'project')
      .where('project.project_id = :projectId', { projectId })
      .select(['user.id', 'user.username', 'user.email'])
      .getMany();

    if (!projectEmployees || projectEmployees.length === 0) {
      return [];
    }

    // Récupérer tous les types de points de performance
    const performancePointTypes =
      await this.performancePointTypeRepository.find();

    // Calculer le score moyen de l'équipe par point de performance pour ce projet
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
      teamAverageScoresByPerformancePoint[pointType.name] =
        avgScoreResult.avgScore ? parseFloat(avgScoreResult.avgScore) : null;
    }

    // 4. Pour chaque employé du projet, récupérer les statistiques spécifiques
    const employeeStats = await Promise.all(
      projectEmployees.map(async (employee) => {
        // Récupérer le score moyen de l'employé pour ce projet
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

        // Récupérer le nombre total d'évaluations complétées par l'employé pour ce projet
        const numberOfEvaluationsResult =
          await this.evaluationSessionRepository.count({
            where: {
              evaluatee: { id: employee.id },
              projectId: projectId,
              status: 'completed',
            },
          });

        // Récupérer le total des points de performance de l'employé pour ce projet
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

        // Calculer le score moyen par point de performance pour CET employé dans ce projet
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

        // Calculer le score moyen du projet pour CET employé
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

        // Calculer le score moyen des points de performance pour CET employé dans ce projet
        const projectAveragePerformancePointScoreResult =
          await this.performancePointChangeRepository
            .createQueryBuilder('ppc')
            .leftJoin('ppc.responseValue', 'rv')
            .leftJoin('rv.evaluationResponse', 'er')
            .leftJoin('er.session', 'es')
            .where('es.evaluatee.id = :employeeId', { employeeId: employee.id })
            .andWhere('es.projectId = :projectId')
            .select('AVG(ppc.score)', 'averagePoints')
            .setParameters({ projectId: projectId }) // Correction ici : s'assurer que projectId est passé comme paramètre nommé
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
          averageScore,
          numberOfEvaluations: numberOfEvaluationsResult,
          totalPerformancePoints,
          projectAverageScore,
          projectAveragePerformancePointScore,
          averageScoresByPerformancePoint,
          teamAverageScoresByPerformancePoint,
        };
      }),
    );

    return employeeStats;
  }
}

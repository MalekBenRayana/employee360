import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { User } from '../user/user.entity';
import { PerformancePointType } from '../performance-point-type/performance-point-type.entity';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';

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
    @InjectRepository(EvaluationSession) // Inject EvaluationSession repository if it exists
    private readonly evaluationSessionRepository?: Repository<EvaluationSession>,
    @InjectRepository(PerformancePointChange)
    private readonly performancePointChangeRepository?: Repository<PerformancePointChange>,
  ) {}

  async getAdminDashboardData() {
    const totalEmployees = await this.getTotalEmployees();
    const totalPerformancePointTypes =
      await this.getTotalPerformancePointTypes();
    const totalEvaluations = await this.getTotalEvaluations();
    const averageOverallScoreCurrentPeriod =
      await this.getAverageOverallScoreCurrentPeriod();
    const averageScoresByPerformancePointCurrentPeriod =
      await this.getAverageScoresByPerformancePointCurrentPeriod();
    const evaluationsCurrentPeriod = await this.getEvaluationsCurrentPeriod();
    const employeesWithoutEvaluationCurrentPeriod =
      await this.getEmployeesWithoutEvaluationCurrentPeriod();
    const averageOverallScoreTrend = await this.getAverageOverallScoreTrend(6);
    const evaluationsTrend = await this.getEvaluationsTrend(6);
    const employeeScoreDistributionCurrentPeriod =
      await this.getEmployeeScoreDistributionCurrentPeriod();
    const performancePointScoreTrend =
      await this.getPerformancePointScoreTrend(3);
    const evaluationsInProgress = this.evaluationSessionRepository
      ? await this.getEvaluationsInProgress()
      : 0;
    const performancePointParticipationRate =
      await this.getPerformancePointParticipationRate();

    return {
      totalEmployees,
      totalPerformancePointTypes,
      totalEvaluations,
      averageOverallScoreCurrentPeriod,
      averageScoresByPerformancePointCurrentPeriod,
      evaluationsCurrentPeriod,
      employeesWithoutEvaluationCurrentPeriod,
      averageOverallScoreTrend,
      evaluationsTrend,
      employeeScoreDistributionCurrentPeriod,

      performancePointScoreTrend,
      evaluationsInProgress,
      performancePointParticipationRate,
    };
  }

  async getTotalEmployees(): Promise<number> {
    return this.userRepository.count({});
  }

  async getTotalPerformancePointTypes(): Promise<number> {
    return this.performancePointTypeRepository.count();
  }

  async getTotalEvaluations(): Promise<number> {
    const result = await this.employeePointPeriodAggregateRepository
      .createQueryBuilder('aggregate')
      .select('SUM(aggregate.numberOfEvaluations)', 'total')
      .getRawOne();
    return parseInt(result.total || '0', 10);
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
        ), // Exclude employees with evaluations
      },
    });
  }

  async getAverageOverallScoreTrend(
    numberOfPeriods: number,
  ): Promise<{ period: string; averageScore: number }[]> {
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

    return trendData.sort((a, b) => a.period.localeCompare(b.period)); // Sort chronologically
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

    return trendData.sort((a, b) => a.period.localeCompare(b.period)); // Sort chronologically
  }

  async getEmployeeScoreDistributionCurrentPeriod(): Promise<
    { range: string; count: number }[]
  > {
    const currentPeriod = this.getCurrentPeriodIdentifier();
    // Get average score per employee for the current period
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
      const score = parseFloat(empAvg.averageScore || '0'); // Handle null or undefined
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
        }; // Sort
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
    return `${year}-${month.toString().padStart(2, '0')}`;
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
}

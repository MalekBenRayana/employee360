import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(EmployeePointPeriodAggregate)
    private readonly employeePointPeriodAggregateRepository: Repository<EmployeePointPeriodAggregate>,
  ) {}

  async calculateEvaluateeStats(evaluateeId: number) {
    const aggregates = await this.employeePointPeriodAggregateRepository.find({
      where: { evaluatee: { id: evaluateeId } },
      relations: ['pointType'],
    });

    const totalEvaluations = aggregates.reduce(
      (sum, agg) => sum + agg.numberOfEvaluations,
      0,
    );

    const averageScoresByPerformancePoint: { [pointTypeName: string]: number } =
      {};
    aggregates.forEach((aggregate) => {
      if (aggregate.pointType && aggregate.averageScore !== null) {
        averageScoresByPerformancePoint[aggregate.pointType.name] = parseFloat(
          aggregate.averageScore.toFixed(2),
        );
      }
    });

    const averageOverallScore = 0;

    return {
      averageOverallScore: parseFloat(averageOverallScore.toFixed(2)),
      totalEvaluations,
      averageScoresByPerformancePoint,
      aggregatedScoresByPeriod: {},
    };
  }

  async getEvaluateeScoreHistory(evaluateeId: number) {
    const periodAggregates =
      await this.employeePointPeriodAggregateRepository.find({
        where: { evaluatee: { id: evaluateeId } },
        order: { period: 'ASC' },
      });

    return {
      dates: periodAggregates.map((item) => item.period),
      scores: periodAggregates.map((item) =>
        item.averageScore !== null
          ? parseFloat(item.averageScore.toFixed(2))
          : 0,
      ),
    };
  }
}

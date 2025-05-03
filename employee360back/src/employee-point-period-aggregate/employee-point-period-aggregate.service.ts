import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeePointPeriodAggregate } from './employee-point-period-aggregate.entity';

@Injectable()
export class EmployeePointPeriodAggregateService {
  constructor(
    @InjectRepository(EmployeePointPeriodAggregate)
    private readonly employeePointPeriodAggregateRepository: Repository<EmployeePointPeriodAggregate>,
  ) {}

  async create(
    aggregate: Partial<EmployeePointPeriodAggregate>,
  ): Promise<EmployeePointPeriodAggregate> {
    return this.employeePointPeriodAggregateRepository.save(
      this.employeePointPeriodAggregateRepository.create(aggregate),
    );
  }

  async findAll(): Promise<EmployeePointPeriodAggregate[]> {
    return this.employeePointPeriodAggregateRepository.find({
      relations: ['evaluatee', 'pointType'],
    });
  }

  async findOne(id: number): Promise<EmployeePointPeriodAggregate> {
    const aggregate = await this.employeePointPeriodAggregateRepository.findOne(
      {
        where: { id },
        relations: ['evaluatee', 'pointType'],
      },
    );
    if (!aggregate) {
      throw new NotFoundException(
        `Employee Point Period Aggregate with ID "${id}" not found`,
      );
    }
    return aggregate;
  }

  async findByEvaluateeAndPeriodAndPointType(
    evaluateeId: number,
    period: string,
    pointTypeId: number,
  ): Promise<EmployeePointPeriodAggregate | null> {
    return this.employeePointPeriodAggregateRepository.findOne({
      where: {
        evaluatee: { id: evaluateeId },
        period: period,
        pointType: { id: pointTypeId },
      },
      relations: ['pointType'],
    });
  }

  async findAllByEvaluatee(
    evaluateeId: number,
  ): Promise<EmployeePointPeriodAggregate[]> {
    return this.employeePointPeriodAggregateRepository.find({
      where: { evaluatee: { id: evaluateeId } },
      relations: ['pointType'],
    });
  }

  async findAllByEvaluateeAndPeriod(
    evaluateeId: number,
    period: string,
  ): Promise<EmployeePointPeriodAggregate[]> {
    return this.employeePointPeriodAggregateRepository.find({
      where: { evaluatee: { id: evaluateeId }, period: period },
      relations: ['pointType'],
    });
  }

  async update(
    id: number,
    aggregateData: Partial<EmployeePointPeriodAggregate>,
  ): Promise<EmployeePointPeriodAggregate> {
    const aggregate = await this.findOne(id);
    const updatedAggregate = { ...aggregate, ...aggregateData };
    await this.employeePointPeriodAggregateRepository.save(updatedAggregate);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.employeePointPeriodAggregateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Employee Point Period Aggregate with ID "${id}" not found`,
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformancePointChange } from './performance-point-change.entity';

@Injectable()
export class PerformancePointChangeService {
  constructor(
    @InjectRepository(PerformancePointChange)
    private readonly performancePointChangeRepository: Repository<PerformancePointChange>,
  ) {}

  async create(
    performancePointChange: Partial<PerformancePointChange>,
  ): Promise<PerformancePointChange> {
    return this.performancePointChangeRepository.save(
      this.performancePointChangeRepository.create(performancePointChange),
    );
  }

  async findAll(): Promise<PerformancePointChange[]> {
    return this.performancePointChangeRepository.find({
      relations: ['responseValue', 'pointType'],
    });
  }

  async findOne(id: number): Promise<PerformancePointChange> {
    const pointChange = await this.performancePointChangeRepository.findOne({
      where: { id },
      relations: ['responseValue', 'pointType'],
    });
    if (!pointChange) {
      throw new NotFoundException(
        `Performance Point Change with ID "${id}" not found`,
      );
    }
    return pointChange;
  }

  async update(
    id: number,
    pointChangeData: Partial<PerformancePointChange>,
  ): Promise<PerformancePointChange> {
    const pointChange = await this.findOne(id);
    await this.performancePointChangeRepository.update(id, pointChangeData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.performancePointChangeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Performance Point Change with ID "${id}" not found`,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePerformancePointTypeDto } from './dto/update-performance-point-type.dto';
import { CreatePerformancePointTypeDto } from './dto/create-performance-point-type.dto';
import { PerformancePointType } from './performance-point-type.entity';

@Injectable()
export class PerformancePointTypeService {
  constructor(
    @InjectRepository(PerformancePointType)
    private readonly performancePointTypeRepository: Repository<PerformancePointType>,
  ) {}

  async create(
    createPerformancePointTypeDto: CreatePerformancePointTypeDto,
  ): Promise<PerformancePointType> {
    const performancePointType = this.performancePointTypeRepository.create(
      createPerformancePointTypeDto,
    );
    return await this.performancePointTypeRepository.save(performancePointType);
  }

  async findAll(): Promise<PerformancePointType[]> {
    return await this.performancePointTypeRepository.find();
  }

  async findOne(id: number): Promise<PerformancePointType> {
    return await this.performancePointTypeRepository.findOneOrFail({
      where: { id },
    });
  }

  async update(
    id: number,
    updatePerformancePointTypeDto: UpdatePerformancePointTypeDto,
  ): Promise<PerformancePointType> {
    await this.performancePointTypeRepository.update(
      id,
      updatePerformancePointTypeDto,
    );
    return await this.performancePointTypeRepository.findOneOrFail({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.performancePointTypeRepository.delete(id);
  }
}

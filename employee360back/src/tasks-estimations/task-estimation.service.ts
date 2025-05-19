import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { TaskEstimation } from './task-estimation.entity';

@Injectable()
export class TaskEstimationService {
  constructor(
    @InjectRepository(TaskEstimation)
    private readonly taskEstimationRepository: Repository<TaskEstimation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    data: Partial<TaskEstimation>,
  ): Promise<TaskEstimation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const newTaskEstimation = this.taskEstimationRepository.create({
      ...data,
      user,
    });
    return this.taskEstimationRepository.save(newTaskEstimation);
  }

  async update(
    id: number,
    data: Partial<TaskEstimation>,
  ): Promise<TaskEstimation> {
    await this.taskEstimationRepository.update(id, data);
    return this.taskEstimationRepository.findOneOrFail({
      where: { id },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<TaskEstimation | undefined> {
    return (
      (await this.taskEstimationRepository.findOne({
        where: { id },
        relations: ['user'],
      })) || undefined
    );
  }

  async findAll(): Promise<TaskEstimation[]> {
    return this.taskEstimationRepository.find({ relations: ['user'] });
  }

  async delete(id: number): Promise<void> {
    await this.taskEstimationRepository.delete(id);
  }

  async findByUserId(userId: number): Promise<TaskEstimation[]> {
    return this.taskEstimationRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findByUserIdAndPeriod(
    userId: number,
    periodStart?: Date,
    periodEnd?: Date,
  ): Promise<TaskEstimation[]> {
    const where: any = { user: { id: userId } };
    if (periodStart) {
      where.periodStart = periodStart;
    }
    if (periodEnd) {
      where.periodEnd = periodEnd;
    }
    return this.taskEstimationRepository.find({
      where,
      relations: ['user'],
    });
  }

  async createOrUpdate(
    userId: number,
    data: Partial<TaskEstimation>,
  ): Promise<TaskEstimation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const existingEstimation = await this.taskEstimationRepository.findOne({
      where: {
        user: { id: userId },
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    });

    if (existingEstimation) {
      return this.taskEstimationRepository.save({
        ...existingEstimation,
        ...data,
        user,
      });
    } else {
      const newTaskEstimation = this.taskEstimationRepository.create({
        ...data,
        user,
      });
      return this.taskEstimationRepository.save(newTaskEstimation);
    }
  }
}

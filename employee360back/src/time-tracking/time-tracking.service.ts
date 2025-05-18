import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTracking } from './time-tracking.entity';
import { User } from '../user/user.entity';

interface ExternalTimeTrackingData {
  userId: number;
  retards?: number;
  debut: string;
  fin: string;
  heures: number;
  [key: string]: any;
}

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeTracking)
    private readonly timeTrackingRepository: Repository<TimeTracking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(timeTrackingData: Partial<TimeTracking>): Promise<TimeTracking> {
    const timeTracking = this.timeTrackingRepository.create(timeTrackingData);
    return this.timeTrackingRepository.save(timeTracking);
  }

  async findAll(): Promise<TimeTracking[]> {
    return this.timeTrackingRepository.find();
  }

  async findOne(id: number): Promise<TimeTracking> {
    return this.timeTrackingRepository.findOneOrFail({ where: { id } });
  }

  async update(
    id: number,
    timeTrackingData: Partial<TimeTracking>,
  ): Promise<TimeTracking> {
    await this.timeTrackingRepository.update(id, timeTrackingData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.timeTrackingRepository.delete(id);
  }

  async processExternalTimeTracking(
    externalData: ExternalTimeTrackingData[],
  ): Promise<TimeTracking[]> {
    const timeTrackingEntries: TimeTracking[] = [];

    for (const data of externalData) {
      const timeTrackingEntry: Partial<TimeTracking> = {
        userId: data.userId,
        nbreRetards: data.retards || 0,
        startDate: new Date(data.debut),
        endDate: new Date(data.fin),
        heuresRequises: data.heures,
      };
      timeTrackingEntries.push(
        this.timeTrackingRepository.create(timeTrackingEntry),
      );
    }

    return this.timeTrackingRepository.save(timeTrackingEntries);
  }

  async findByUserId(userId: number): Promise<TimeTracking[]> {
    return this.timeTrackingRepository.find({ where: { userId } });
  }

  async findByUserName(userName: string): Promise<TimeTracking[]> {
    return this.timeTrackingRepository
      .createQueryBuilder('timeTracking')
      .leftJoinAndSelect('timeTracking.user', 'user')
      .where('user.username = :userName', { userName })
      .getMany();
  }

  async getTotalRetards(): Promise<number> {
    const result = await this.timeTrackingRepository
      .createQueryBuilder('timeTracking')
      .select('SUM(timeTracking.nbreRetards)', 'total')
      .getRawOne();
    return result.total || 0;
  }

  async getTotalHeuresRequises(): Promise<number> {
    const result = await this.timeTrackingRepository
      .createQueryBuilder('timeTracking')
      .select('SUM(timeTracking.heuresRequises)', 'total')
      .getRawOne();
    return result.total || 0;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTracking } from './time-tracking.entity';
import { User } from '../user/user.entity';
import { TaskEstimation } from '../tasks-estimations/task-estimation.entity';
import { Project } from 'src/projects/project.entity';

interface ExternalTimeTrackingData {
  userId: number;
  retards?: number;
  debut: string;
  fin: string;
  heures: number;
  [key: string]: any;
}

interface TeamTimeTrackingAndTaskEstimationStats {
  employeeId: number;
  username: string;
  email: string;
  totalRetards: number;
  totalHeuresRequises: number;
  timeTrackingDetails: TimeTracking[];
  totalEstimatedTime: number;
  totalRealizedTime: number;
  numberOfDueDateViolations: number;
  totalViolationPeriod: number | null;
  taskEstimationDetails: TaskEstimation[];
  projects: { project_id: number; project_name: string }[]; // Nouveau champ pour les projets
}

interface TeamMemberTimeTrackingStats {
  employeeId: number;
  username: string;
  email: string;
  totalRetards: number;
  totalHeuresRequises: number;
  timeTrackingDetails: TimeTracking[];
}

interface TeamMemberTaskEstimationStats {
  employeeId: number;
  username: string;
  email: string;
  totalEstimatedTime: number;
  totalRealizedTime: number;
  numberOfDueDateViolations: number;
  totalViolationPeriod: number | null;
  taskEstimationDetails: TaskEstimation[];
}

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeTracking)
    private readonly timeTrackingRepository: Repository<TimeTracking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TaskEstimation)
    private readonly taskEstimationRepository: Repository<TaskEstimation>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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

  async getTeamTimeTrackingAndTaskEstimationStats(
    managerId: number,
  ): Promise<TeamTimeTrackingAndTaskEstimationStats[]> {
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

    const managedProjects = await this.projectRepository.findBy({
      manager: { id: managerId },
    });

    if (!managedProjects || managedProjects.length === 0) {
      return []; // Le manager n'a pas de projets assignés
    }

    const teamStats: TeamTimeTrackingAndTaskEstimationStats[] = [];

    for (const project of managedProjects) {
      const projectEmployees = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.projects', 'project')
        .where('project.project_id = :projectId', {
          projectId: project.project_id,
        })
        .select(['user.id', 'user.username', 'user.email'])
        .leftJoinAndSelect('user.projects', 'assignedProject') // Charger la relation projects
        .getMany();

      if (projectEmployees && projectEmployees.length > 0) {
        for (const employee of projectEmployees) {
          const timeTrackings = await this.timeTrackingRepository.findBy({
            userId: employee.id,
          });
          const totalRetards = timeTrackings.reduce(
            (sum, track) => sum + (track.nbreRetards || 0),
            0,
          );
          const totalHeuresRequises = timeTrackings.reduce(
            (sum, track) => sum + (track.heuresRequises || 0),
            0,
          );

          const taskEstimations = await this.taskEstimationRepository.findBy({
            user: { id: employee.id },
          });
          const totalEstimatedTime = taskEstimations.reduce(
            (sum, estimation) => sum + (estimation.totalEstimatedTime || 0),
            0,
          );
          const totalRealizedTime = taskEstimations.reduce(
            (sum, estimation) => sum + (estimation.totalRealizedTime || 0),
            0,
          );
          const numberOfDueDateViolations = taskEstimations.reduce(
            (sum, estimation) =>
              sum + (estimation.numberOfDueDateViolations || 0),
            0,
          );
          const totalViolationPeriod = taskEstimations.reduce(
            (sum, estimation) => sum + (estimation.totalViolationPeriod || 0),
            0,
          );

          teamStats.push({
            employeeId: employee.id,
            username: employee.username,
            email: employee.email,
            totalRetards,
            totalHeuresRequises,
            timeTrackingDetails: timeTrackings,
            totalEstimatedTime,
            totalRealizedTime,
            numberOfDueDateViolations,
            totalViolationPeriod,
            taskEstimationDetails: taskEstimations,
            projects: employee.projects.map((proj) => ({
              // Formatter les informations du projet
              project_id: proj.project_id,
              project_name: proj.project_name,
            })),
          });
        }
      }
    }

    return teamStats;
  }

  async getTeamMemberTimeTrackingDetails(
    managerId: number,
    employeeId: number,
  ): Promise<TeamMemberTimeTrackingStats> {
    const project = await this.projectRepository.findOne({
      where: { manager: { id: managerId } },
      relations: ['users'],
    });

    if (!project || !project.users.some((user) => user.id === employeeId)) {
      throw new NotFoundException(
        `L'employé avec l'ID ${employeeId} n'appartient pas à l'équipe du manager avec l'ID ${managerId} (via les projets).`,
      );
    }

    const employee = await this.userRepository.findOneOrFail({
      where: { id: employeeId },
    });
    const timeTrackings = await this.timeTrackingRepository.findBy({
      userId: employeeId,
    });
    const totalRetards = timeTrackings.reduce(
      (sum, track) => sum + (track.nbreRetards || 0),
      0,
    );
    const totalHeuresRequises = timeTrackings.reduce(
      (sum, track) => sum + (track.heuresRequises || 0),
      0,
    );

    return {
      employeeId: employee.id,
      username: employee.username,
      email: employee.email,
      totalRetards,
      totalHeuresRequises,
      timeTrackingDetails: timeTrackings,
    };
  }

  async getTeamMemberTaskEstimationDetails(
    managerId: number,
    employeeId: number,
  ): Promise<TeamMemberTaskEstimationStats> {
    const project = await this.projectRepository.findOne({
      where: { manager: { id: managerId } },
      relations: ['users'],
    });

    if (!project || !project.users.some((user) => user.id === employeeId)) {
      throw new NotFoundException(
        `L'employé avec l'ID ${employeeId} n'appartient pas à l'équipe du manager avec l'ID ${managerId} (via les projets).`,
      );
    }

    const employee = await this.userRepository.findOneOrFail({
      where: { id: employeeId },
    });
    const taskEstimations = await this.taskEstimationRepository.findBy({
      user: { id: employeeId },
    });
    const totalEstimatedTime = taskEstimations.reduce(
      (sum, estimation) => sum + (estimation.totalEstimatedTime || 0),
      0,
    );
    const totalRealizedTime = taskEstimations.reduce(
      (sum, estimation) => sum + (estimation.totalRealizedTime || 0),
      0,
    );
    const numberOfDueDateViolations = taskEstimations.reduce(
      (sum, estimation) => sum + (estimation.numberOfDueDateViolations || 0),
      0,
    );
    const totalViolationPeriod = taskEstimations.reduce(
      (sum, estimation) => sum + (estimation.totalViolationPeriod || 0),
      0,
    );

    return {
      employeeId: employee.id,
      username: employee.username,
      email: employee.email,
      totalEstimatedTime,
      totalRealizedTime,
      numberOfDueDateViolations,
      totalViolationPeriod,
      taskEstimationDetails: taskEstimations,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectAssignmentLogRepository } from './project-assignment-log.repository';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/user/user.entity';
import { ProjectAssignmentLog } from './project-assignment-log.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class ProjectAssignmentLogsService {
  constructor(
    @InjectRepository(ProjectAssignmentLogRepository)
    private readonly projectAssignmentLogRepository: ProjectAssignmentLogRepository,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createLog(
    projectId: number,
    userId: number,
    action: string,
  ): Promise<ProjectAssignmentLog> {
    const log = new ProjectAssignmentLog();
    log.project = { project_id: projectId } as any;
    log.user = { id: userId } as any;
    log.action = action;
    log.timestamp = new Date();

    return this.projectAssignmentLogRepository.save(log);
  }
}

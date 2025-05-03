import { EntityRepository, Repository } from 'typeorm';
import { ProjectAssignmentLog } from './project-assignment-log.entity';

@EntityRepository(ProjectAssignmentLog)
export class ProjectAssignmentLogRepository extends Repository<ProjectAssignmentLog> {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectAssignmentLogsService } from './project-assignment-logs.service';
import { ProjectAssignmentLogRepository } from './project-assignment-log.repository';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectAssignmentLogRepository, Project, User]),
  ],
  providers: [ProjectAssignmentLogsService],
  exports: [ProjectAssignmentLogsService],
})
export class ProjectAssignmentLogsModule {}

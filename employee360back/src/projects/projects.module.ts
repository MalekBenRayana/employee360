import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectAssignmentLog } from 'src/project-assignment-logs/project-assignment-log.entity';
import { User } from 'src/user/user.entity';
import { Department } from 'src/departments/department.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { UserProjectRole } from 'src/user-project-role/user-project-role.entity';
import { Role } from 'src/roles/role.entity';
import { ProjectRole } from 'src/project-role/project-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectAssignmentLog,
      User,
      Department,
      EvaluationSession,
      UserProjectRole,
      Role,
      ProjectRole,
    ]),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}

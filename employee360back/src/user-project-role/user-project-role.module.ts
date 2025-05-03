import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProjectRoleService } from './user-project-role.service';
import { UserProjectRole } from './user-project-role.entity';
import { User } from 'src/user/user.entity';
import { Project } from 'src/projects/project.entity';
import { Role } from 'src/roles/role.entity';
import { ProjectRole } from 'src/project-role/project-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProjectRole,
      User,
      Project,
      Role,
      ProjectRole,
    ]),
  ],
  providers: [UserProjectRoleService],
  exports: [UserProjectRoleService],
})
export class UserProjectRoleModule {}

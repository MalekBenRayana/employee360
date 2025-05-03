import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRole } from './project-role.entity';
import { ProjectRoleService } from './project-role.service';
import { ProjectRoleController } from './project-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectRole])],
  controllers: [ProjectRoleController],
  providers: [ProjectRoleService],
  exports: [ProjectRoleService],
})
export class ProjectRoleModule {}

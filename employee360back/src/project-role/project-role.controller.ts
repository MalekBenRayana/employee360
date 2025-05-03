import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProjectRoleService } from './project-role.service';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';
import { ProjectRole } from './project-role.entity';

@Controller('project-roles')
export class ProjectRoleController {
  constructor(private readonly projectRoleService: ProjectRoleService) {}

  @Post()
  async create(
    @Body() createProjectRoleDto: CreateProjectRoleDto,
  ): Promise<ProjectRole> {
    return this.projectRoleService.create(createProjectRoleDto);
  }

  @Get()
  async findAll(): Promise<ProjectRole[]> {
    return this.projectRoleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ProjectRole> {
    return this.projectRoleService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProjectRoleDto: UpdateProjectRoleDto,
  ): Promise<ProjectRole> {
    return this.projectRoleService.update(id, updateProjectRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.projectRoleService.remove(id);
  }
}

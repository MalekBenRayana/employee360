import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ParseIntPipe } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.projectsService.remove(id);
      return { message: `Project with ID ${id} successfully deleted.` };
    } catch (error) {
      throw error;
    }
  }

  @Post(':projectId/assign/:userId')
  assignUserToProject(
    @Param('projectId') projectId: number,
    @Param('userId') userId: number,
  ) {
    return this.projectsService.assignUserToProject(projectId, userId);
  }

  @Get('user/:userId')
  getUserAssignedProjects(@Param('userId') userId: number) {
    return this.projectsService.getUserAssignedProjects(userId);
  }
  @Get('manager/:managerId')
  async getProjectsByManagerId(
    @Param('managerId', ParseIntPipe) managerId: number,
  ): Promise<Project[]> {
    return this.projectsService.getManagerProjectsList(managerId);
  }

}

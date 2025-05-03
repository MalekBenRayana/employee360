import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRole } from './project-role.entity';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';

@Injectable()
export class ProjectRoleService {
  constructor(
    @InjectRepository(ProjectRole)
    private readonly projectRoleRepository: Repository<ProjectRole>,
  ) {}

  async create(
    createProjectRoleDto: CreateProjectRoleDto,
  ): Promise<ProjectRole> {
    const projectRole = this.projectRoleRepository.create(createProjectRoleDto);
    return await this.projectRoleRepository.save(projectRole);
  }

  async findAll(): Promise<ProjectRole[]> {
    return await this.projectRoleRepository.find();
  }

  async findOne(id: number): Promise<ProjectRole> {
    const projectRole = await this.projectRoleRepository.findOne({
      where: { id },
    });

    if (!projectRole) {
      throw new Error(`ProjectRole with id ${id} not found`);
    }

    return projectRole;
  }

  async update(
    id: number,
    updateProjectRoleDto: UpdateProjectRoleDto,
  ): Promise<ProjectRole> {
    const projectRole = await this.findOne(id);
    this.projectRoleRepository.merge(projectRole, updateProjectRoleDto);
    return await this.projectRoleRepository.save(projectRole);
  }

  async remove(id: number): Promise<void> {
    const projectRole = await this.findOne(id);
    await this.projectRoleRepository.delete(id);
  }
}

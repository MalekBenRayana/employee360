import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilteredUserDto } from 'src/user/dto/filtered-user.dto';
import { User } from 'src/user/user.entity';
import { ProjectAssignmentLog } from 'src/project-assignment-logs/project-assignment-log.entity';
import { Department } from 'src/departments/department.entity';
import { Project } from './project.entity';
import { Role } from 'src/roles/role.entity';
import { ProjectRole } from 'src/project-role/project-role.entity';
import { UserProjectRole } from 'src/user-project-role/user-project-role.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProjectAssignmentLog)
    private readonly projectAssignmentLogRepository: Repository<ProjectAssignmentLog>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ProjectRole)
    private readonly projectRoleRepository: Repository<ProjectRole>,
    @InjectRepository(UserProjectRole)
    private readonly userProjectRoleRepository: Repository<UserProjectRole>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<any> {
    const {
      project_name,
      description,
      start_date,
      end_date,
      status,
      priority,
      department_id,
      manager_id,
      users,
    } = createProjectDto;

    const manager = await this.userRepository.findOne({
      where: { id: manager_id },
    });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${manager_id} not found`);
    }

    const userIds = users.map((u) => u.user_id);
    const roleIds = users.map((u) => u.role_id);

    console.log('IDs de rôle reçus du DTO:', roleIds);

    const usersArray = await this.userRepository.findByIds(userIds);
    if (usersArray.length !== userIds.length) {
      throw new NotFoundException('Some users not found');
    }

    const uniqueRoleIds = [...new Set(roleIds)];
    const rolesMap = new Map<number, ProjectRole>();

    const fetchedRoles =
      await this.projectRoleRepository.findByIds(uniqueRoleIds);
    fetchedRoles.forEach((role) => rolesMap.set(role.id, role));

    const rolesArray: ProjectRole[] = [];
    for (const roleId of roleIds) {
      const role = rolesMap.get(roleId);
      if (!role) {
        console.error(
          `Rôle avec l'ID ${roleId} non trouvé dans la base de données.`,
        );
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      rolesArray.push(role);
    }

    const department = await this.departmentRepository.findOne({
      where: { department_id },
    });
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${department_id} not found`,
      );
    }

    const newProject = this.projectRepository.create({
      project_name,
      description,
      start_date,
      end_date,
      status,
      priority,
      manager,
      departments: [department],
    });

    const savedProject = await this.projectRepository.save(newProject);

    const userProjectRoles = users.map((entry, index) => {
      const user = usersArray.find((u) => u.id === entry.user_id);
      const role = rolesArray[index];

      return this.userProjectRoleRepository.create({
        user,
        project: savedProject,
        projectRole: role,
      });
    });

    await this.userProjectRoleRepository.save(userProjectRoles);

    const usersWithRoles = userProjectRoles.map((upr) => ({
      user_id: upr.user.id,
      username: upr.user.username,
      role: upr.projectRole.name,
    }));

    return {
      ...savedProject,
      users_with_roles: usersWithRoles,
    };
  }

  async findAll(): Promise<any[]> {
    const projects = await this.projectRepository.find({
      relations: ['users'],
    });

    return projects.map((project) => ({
      ...project,
      users: plainToInstance(FilteredUserDto, project.users, {
        excludeExtraneousValues: true,
      }),
    }));
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { project_id: id },
      relations: ['manager', 'departments', 'users'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<any> {
    const fullProject = await this.projectRepository.findOne({
      where: { project_id: id },
      relations: ['manager', 'departments'],
    });

    if (!fullProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const {
      project_name,
      description,
      start_date,
      end_date,
      status,
      priority,
      department_id,
      manager_id,
      users,
    } = updateProjectDto;

    if (users && Array.isArray(users)) {
      await this.userProjectRoleRepository.delete({
        project: { project_id: id },
      });

      const userIds = users.map((u) => u.user_id);
      const usersArray = await this.userRepository.findByIds(userIds);
      if (usersArray.length !== users.length) {
        throw new NotFoundException('Some users not found');
      }

      const uniqueRoleIds = [...new Set(users.map((u) => u.role_id))];
      const fetchedRolesMap = new Map<number, ProjectRole>();
      const fetchedRoles =
        await this.projectRoleRepository.findByIds(uniqueRoleIds);
      fetchedRoles.forEach((role) => fetchedRolesMap.set(role.id, role));

      const userProjectRolesToCreate = users.map((u) => {
        const user = usersArray.find((ua) => ua.id === u.user_id);
        const role = fetchedRolesMap.get(u.role_id);
        if (!role) {
          throw new NotFoundException(`Role with ID "${u.role_id}" not found`);
        }
        return this.userProjectRoleRepository.create({
          user: user,
          project: fullProject,
          projectRole: role,
        });
      });

      await this.userProjectRoleRepository.save(userProjectRolesToCreate);
    }

    if (project_name) fullProject.project_name = project_name;
    if (description) fullProject.description = description;
    if (start_date) fullProject.start_date = start_date;
    if (end_date) fullProject.end_date = end_date;
    if (status) fullProject.status = status;
    if (priority) fullProject.priority = priority;

    if (department_id) {
      const department = await this.departmentRepository.findOne({
        where: { department_id },
      });
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${department_id} not found`,
        );
      }
      fullProject.departments = [department];
    }

    if (manager_id) {
      const manager = await this.userRepository.findOne({
        where: { id: manager_id },
      });
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${manager_id} not found`);
      }
      fullProject.manager = manager;
    }

    const updatedProject = await this.projectRepository.save(fullProject);

    const updatedUserProjectRoles = await this.userProjectRoleRepository.find({
      where: { project: { project_id: id } },
      relations: ['user', 'projectRole'],
    });

    const usersWithRoles = updatedUserProjectRoles.map((upr) => ({
      user_id: upr.user.id,
      username: upr.user.username,
      role: upr.projectRole.name,
    }));

    return {
      ...updatedProject,
      users: updatedUserProjectRoles.map((upr) => ({ id: upr.user.id })),
      users_with_roles: usersWithRoles,
    };
  }

  async remove(id: number): Promise<void> {
    await this.departmentRepository
      .createQueryBuilder()
      .delete()
      .from('department_projects')
      .where('project_id = :id', { id })
      .execute();

    await this.userProjectRoleRepository.delete({
      project: { project_id: id },
    });

    await this.projectAssignmentLogRepository.delete({
      project: { project_id: id },
    });

    const result = await this.projectRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async assignUserToProject(
    projectId: number,
    userId: number,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!project.users.some((u) => u.id === user.id)) {
      project.users.push(user);
    }

    return this.projectRepository.save(project);
  }

  async getUserAssignedProjects(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['projects'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.projects.map((project) => ({
      ...project,
      users: plainToInstance(FilteredUserDto, project.users, {
        excludeExtraneousValues: true,
      }),
    }));
  }

  async getManagerProjectsList(managerId: number): Promise<Project[]> {
    // 1. Vérifier si le manager existe
    const manager = await this.userRepository.findOne({ where: { id: managerId } });
    if (!manager) {
      throw new NotFoundException(`Manager avec l'ID ${managerId} non trouvé.`);
    }

    // 2. Récupérer tous les projets où le manager est assigné
    const projects = await this.projectRepository.find({
      where: { manager: { id: managerId } },
      relations: ['departments', 'users'], // Vous pouvez inclure d'autres relations si nécessaire
    });

    return projects;
  }



}

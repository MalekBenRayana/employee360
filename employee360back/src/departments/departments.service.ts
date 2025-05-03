import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Department } from './department.entity';
import { Project } from '../projects/project.entity';
import { User } from '../user/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const { department_name, department_head_id } = createDepartmentDto;

    const department = new Department();
    department.department_name = department_name;

    const departmentHead = await this.userRepository.findOne({
      where: { id: department_head_id },
    });
    if (!departmentHead) {
      throw new NotFoundException('❌ Chef de département introuvable');
    }

    department.department_head = departmentHead;

    return await this.departmentRepository.save(department);
  }

  async addUsersToDepartment(
    departmentId: number,
    userIds: number[],
  ): Promise<Department> {
    if (!departmentId || userIds.length === 0) {
      throw new BadRequestException(
        '❌ Le département ou les utilisateurs sont manquants',
      );
    }

    const department = await this.departmentRepository.findOne({
      where: { department_id: departmentId },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException('❌ Département introuvable');
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });
    if (users.length === 0) {
      throw new NotFoundException('❌ Aucun utilisateur trouvé');
    }

    const newUsers = users.filter(
      (user) =>
        !department.users.some((existingUser) => existingUser.id === user.id),
    );
    if (newUsers.length === 0) {
      throw new BadRequestException(
        '❌ Tous les utilisateurs sont déjà associés à ce département',
      );
    }

    department.users = [...department.users, ...newUsers];

    return this.departmentRepository.save(department);
  }

  async assignProjectsToDepartment(
    departmentId: number,
    projectsIds: number[],
  ): Promise<Department> {
    if (!departmentId)
      throw new BadRequestException('❌ departmentId est requis.');
    if (!Array.isArray(projectsIds) || projectsIds.length === 0) {
      throw new BadRequestException('❌ Il faut fournir une liste de projets.');
    }

    const department = await this.departmentRepository.findOne({
      where: { department_id: departmentId },
      relations: ['projects'],
    });
    if (!department) throw new NotFoundException('❌ Département introuvable');

    const projects = await this.projectRepository.findBy({
      project_id: In(projectsIds),
    });
    if (projects.length !== projectsIds.length) {
      throw new NotFoundException('❌ Certains projets n’existent pas');
    }

    const newProjects = projects.filter(
      (project) =>
        !department.projects.some(
          (existingProject) =>
            existingProject.project_id === project.project_id,
        ),
    );
    if (newProjects.length === 0) {
      throw new BadRequestException(
        '❌ Tous les projets sont déjà associés à ce département',
      );
    }

    department.projects = [...department.projects, ...newProjects];

    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['department_head', 'projects', 'users'],
    });
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { department_id: id },
      relations: ['department_head', 'projects', 'users'],
    });
    if (!department)
      throw new NotFoundException(`❌ Département avec l'ID ${id} introuvable`);
    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    if (!id) throw new BadRequestException('❌ ID du département est requis.');

    const department = await this.departmentRepository.findOne({
      where: { department_id: id },
    });
    if (!department) throw new NotFoundException('❌ Département introuvable');

    if (updateDepartmentDto.department_head_id) {
      const departmentHead = await this.userRepository.findOne({
        where: { id: updateDepartmentDto.department_head_id },
      });
      if (!departmentHead)
        throw new NotFoundException('❌ Chef de département introuvable');
      department.department_head = departmentHead;
    }

    if (updateDepartmentDto.department_name) {
      department.department_name = updateDepartmentDto.department_name;
    }

    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<void> {
    if (!id) throw new BadRequestException('❌ ID du département est requis.');

    const department = await this.findOne(id);
    if (!department)
      throw new NotFoundException(`❌ Département avec l'ID ${id} introuvable`);

    department.projects = [];
    await this.departmentRepository.save(department);
    await this.departmentRepository.remove(department);
  }
}

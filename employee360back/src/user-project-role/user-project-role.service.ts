import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProjectRole } from './user-project-role.entity';
import { UpdateUserProjectRoleDto } from './dto/update-user-project-role.dto';
import { CreateUserProjectRoleDto } from './dto/create-user-project-role.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserProjectRoleService {
  constructor(
    @InjectRepository(UserProjectRole)
    private readonly userProjectRoleRepository: Repository<UserProjectRole>,
  ) {}

  async create(
    createUserProjectRoleDto: CreateUserProjectRoleDto,
  ): Promise<UserProjectRole> {
    const userProjectRole = this.userProjectRoleRepository.create(
      createUserProjectRoleDto,
    );
    return await this.userProjectRoleRepository.save(userProjectRole);
  }

  async findAll(): Promise<UserProjectRole[]> {
    return await this.userProjectRoleRepository.find();
  }

  async findOne(id: number): Promise<UserProjectRole> {
    const userProjectRole = await this.userProjectRoleRepository.findOne({
      where: { id: id } as any,
    });
    if (!userProjectRole) {
      throw new NotFoundException(`UserProjectRole with ID ${id} not found`);
    }
    return userProjectRole;
  }

  async update(
    id: number,
    updateUserProjectRoleDto: UpdateUserProjectRoleDto,
  ): Promise<UserProjectRole> {
    await this.userProjectRoleRepository.update(id, updateUserProjectRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userProjectRoleRepository.delete(id);
  }
}

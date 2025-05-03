import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/permission.entity';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { In } from 'typeorm';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureRoleExists('admin');
      await this.ensureRoleExists('manager');
      await this.ensureRoleExists('employee');
    } catch (error) {
      console.error('Erreur lors de l’initialisation des rôles:', error);
    }
  }

  async ensureRoleExists(name: string): Promise<void> {
    const roleExists = await this.roleRepository.findOne({ where: { name } });
    if (!roleExists) {
      await this.createRole(name);
    }
  }

  async createRole(name: string): Promise<Role> {
    const role = this.roleRepository.create({ name });
    return this.roleRepository.save(role);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async getRolesByNames(roleNames: string[]): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { name: In(roleNames) },
    });
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const permissions =
      await this.permissionsRepository.findByIds(permissionIds);

    role.permissions = permissions;

    return this.roleRepository.save(role);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from 'src/user/dto/create-permission.dto';
import { Role } from 'src/roles/role.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private userService: UserService,
  ) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return await this.permissionsRepository.save(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionsRepository.find();
  }

  async getPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { name },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with name ${name} not found`);
    }
    return permission;
  }

  async getPermissionsByRole(roleName: string): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with name ${roleName} not found`);
    }

    return role.permissions.map((permission) => permission.name);
  }

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });

    if (!role || !permission) {
      throw new NotFoundException('Rôle ou Permission non trouvé');
    }

    if (role.permissions.some((perm) => perm.id === permission.id)) {
      throw new NotFoundException('La permission est déjà assignée à ce rôle');
    }

    role.permissions.push(permission);
    return this.roleRepository.save(role);
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }

    role.permissions = role.permissions.filter(
      (perm) => perm.id !== permissionId,
    );
    return this.roleRepository.save(role);
  }

  async assignPermissionsBasedOnRole(
    userId: number,
    roleId: number,
  ): Promise<User> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    user.permissions = role.permissions;

    return await this.userService.save(user);
  }
}

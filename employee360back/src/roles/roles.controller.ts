import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async createRole(@Body('name') name: string): Promise<Role> {
    return this.rolesService.createRole(name);
  }

  @Get()
  async getAllRoles(): Promise<Role[]> {
    return this.rolesService.getAllRoles();
  }

  @Put(':roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: number,
    @Body('permissions') permissionIds: number[],
  ) {
    return await this.rolesService.assignPermissionsToRole(
      roleId,
      permissionIds,
    );
  }
}

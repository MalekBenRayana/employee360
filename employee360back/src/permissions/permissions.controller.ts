import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from 'src/user/dto/create-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  async findAll(): Promise<Permission[]> {
    return await this.permissionsService.getAllPermissions();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Permission> {
    return await this.permissionsService.getPermissionById(id);
  }

  @Post('assign-to-role')
  async assignPermissionToRole(
    @Body() assignPermissionsDto: { roleId: number; permissionId: number },
  ) {
    const { roleId, permissionId } = assignPermissionsDto;
    return await this.permissionsService.assignPermissionToRole(
      roleId,
      permissionId,
    );
  }

  @Post('assign-to-user')
  async assignPermissions(@Body() assignPermissionsDto: AssignPermissionsDto) {
    const { userId, roleId } = assignPermissionsDto;
    return await this.permissionsService.assignPermissionsBasedOnRole(
      userId,
      roleId,
    );
  }
}

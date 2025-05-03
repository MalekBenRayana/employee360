import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { PermissionGuard } from 'src/permissions/permission.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { ProjectsService } from 'src/projects/projects.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { AssignPermissionsDto } from '../permissions/dto/assign-permissions.dto';
import { CreateTemporaryUserDto } from './dto/CreateTemporaryUserDto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly projectService: ProjectsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      this.logger.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req): Promise<UserProfileDto> {
    const userId = req.user.userId;

    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const roles = user.roles.map((role) => role.name);

      const rolePermissions = await Promise.all(
        roles.map((role) => this.permissionsService.getPermissionsByRole(role)),
      );

      const permissions = rolePermissions.flat();

      const projects =
        await this.projectService.getUserAssignedProjects(userId);

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
        roles: roles,
        permissions: permissions,
        projects: projects,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des données de l'utilisateur",
      );
    }
  }

  @Get('role')
  @UseGuards(JwtAuthGuard)
  async getUserRoles(@Request() req): Promise<{ roles: string[] }> {
    try {
      const userId = req.user.userId;
      const roles = await this.userService.getUserRoles(userId);
      return { roles };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rôles pour l'utilisateur ID ${req.user.userId}`,
        error,
      );
      throw error;
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.userService.findAll();
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des utilisateurs:',
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'utilisateur avec ID ${id}`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ): Promise<User> {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'utilisateur avec ID ${id}`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles(Role.Admin)
  async delete(@Param('id') id: number): Promise<void> {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'utilisateur avec ID ${id}`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    try {
      const userId = req.user.userId;

      this.logger.log(
        `Changement du mot de passe pour l'utilisateur ID: ${userId}`,
      );

      const { currentPassword, newPassword } = changePasswordDto;

      this.logger.log(
        `currentPassword: ${currentPassword}, newPassword: ${newPassword}`,
      );

      if (!currentPassword || !newPassword) {
        this.logger.error('Les mots de passe sont manquants');
        throw new BadRequestException('Les mots de passe sont manquants');
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.error(`Utilisateur avec l'ID ${userId} non trouvé`);
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const isPasswordValid = await this.userService.validatePassword(
        userId,
        currentPassword,
      );
      if (!isPasswordValid) {
        this.logger.error(
          `Mot de passe actuel incorrect pour l'utilisateur ${userId}`,
        );
        throw new Error('Mot de passe actuel incorrect');
      }

      const updatedUser = await this.userService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      this.logger.log(
        `Mot de passe mis à jour pour l'utilisateur ID: ${userId}`,
      );

      return updatedUser;
    } catch (error) {
      this.logger.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<User> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        this.logger.warn(`Utilisateur avec l'email ${email} non trouvé`);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'utilisateur avec l'email ${email}`,
        error,
      );
      throw error;
    }
  }

  @Post('assign-role')
  @UseGuards(JwtAuthGuard)
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.userService.assignRoleToUser(assignRoleDto);
  }

  @Patch('deactivate/:id')
  @UseGuards(JwtAuthGuard)
  async deactivateUser(@Param('id') id: number): Promise<User> {
    try {
      const user = await this.userService.deactivateUser(id);
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la désactivation de l'utilisateur avec ID ${id}`,
        error,
      );
      throw error;
    }
  }

  @Patch('reactivate/:id')
  @UseGuards(JwtAuthGuard)
  async reactivateUser(@Param('id') id: number): Promise<User> {
    try {
      return await this.userService.reactivateUser(id);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la réactivation de l'utilisateur avec ID ${id}`,
        error,
      );
      throw error;
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async findAllActiveUsers(): Promise<User[]> {
    try {
      return await this.userService.findAllActiveUsers();
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des utilisateurs actifs:',
        error,
      );
      throw error;
    }
  }

  @Post('assign-permissions')
  async assignPermissions(@Body() assignPermissionsDto: AssignPermissionsDto) {
    return await this.permissionsService.assignPermissionsBasedOnRole(
      assignPermissionsDto.userId,
      assignPermissionsDto.roleId,
    );
  }

  @Post('create-temporary')
  async createTemporaryUser(
    @Body() createTemporaryUserDto: CreateTemporaryUserDto,
  ) {
    return this.userService.createTemporaryUser(createTemporaryUserDto);
  }

  @Patch('reset-password/:id')
  async ResetPasswordTemporaryUser(
    @Param('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const { currentPassword, newPassword } = changePasswordDto;

      if (!currentPassword || !newPassword) {
        throw new BadRequestException('Les mots de passe sont manquants');
      }

      const isPasswordValid = await this.userService.validatePassword(
        user.id,
        currentPassword,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }

      const updatedUser = await this.userService.ResetPasswordTemporaryUser(
        user.id,
        currentPassword,
        newPassword,
      );
      return updatedUser;
    } catch (error) {
      this.logger.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/role.entity';
import { EmailService } from '../email/email.service';
import { CreateTemporaryUserDto } from './dto/CreateTemporaryUserDto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from 'src/projects/projects.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private rolesService: RolesService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly emailService: EmailService,
    private projectService: ProjectsService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, roleNames } = createUserDto;

    try {
      let roles: Role[] = [];

      if (roleNames && roleNames.length > 0) {
        roles = await this.rolesService.getRolesByNames(roleNames);
        if (!roles.length) {
          throw new BadRequestException('Aucun rôle valide trouvé');
        }
      } else {
        const defaultRole = await this.rolesService.getRoleByName('employee');
        if (!defaultRole) {
          throw new BadRequestException(
            "Le rôle 'employee' n'existe pas dans la base de données.",
          );
        }
        roles = [defaultRole];
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
        roles,
        isActive: true,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error("Erreur lors de la création de l'utilisateur:", error);
      throw new BadRequestException(
        "Erreur lors de la création de l'utilisateur",
      );
    }
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: Partial<UpdateUserDto>,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      if (updateUserDto.roleNames) {
        const roles = await this.rolesService.getRolesByNames(
          updateUserDto.roleNames,
        );
        if (!roles.length) {
          this.logger.error(
            `Aucun rôle valide trouvé pour: ${updateUserDto.roleNames}`,
          );
          throw new BadRequestException('Aucun rôle valide trouvé');
        }

        user.roles = roles;
      }

      Object.assign(user, updateUserDto);

      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la mise à jour de l'utilisateur:",
        error,
      );
      throw new BadRequestException(
        "Erreur lors de la mise à jour de l'utilisateur",
      );
    }
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la suppression de l'utilisateur:",
        error,
      );
      throw new BadRequestException(
        "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }

  async validatePassword(
    userId: number,
    currentPassword: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!currentPassword || !user.password) {
      throw new Error('Mot de passe ou hash manquant');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    return isValid;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    if (isNaN(userId)) {
      throw new BadRequestException('ID utilisateur invalide');
    }

    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (!oldPassword || !newPassword) {
      throw new BadRequestException(
        "L'ancien et le nouveau mot de passe sont requis",
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("L'ancien mot de passe est incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isActive = true;

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    try {
      return this.userRepository.find({ relations: ['roles'] });
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération de tous les utilisateurs:',
        error,
      );
      throw new BadRequestException(
        'Erreur lors de la récupération des utilisateurs',
      );
    }
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const user = await this.findById(userId);
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${userId} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user.roles.map((role) => role.name);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });
      this.logger.log('Utilisateur trouvé par email:', user);
      return user;
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération de l'utilisateur par email:",
        error,
      );
      throw new NotFoundException(
        "Erreur lors de la récupération de l'utilisateur",
      );
    }
  }

  async deactivateUser(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      user.isActive = false;
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la désactivation de l'utilisateur:",
        error,
      );
      throw new BadRequestException(
        "Erreur lors de la désactivation de l'utilisateur",
      );
    }
  }

  async reactivateUser(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Utilisateur avec ID ${id} non trouvé`);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      user.isActive = true;
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la réactivation de l'utilisateur:",
        error,
      );
      throw new BadRequestException(
        "Erreur lors de la réactivation de l'utilisateur",
      );
    }
  }

  async assignRoleToUser(assignRoleDto: AssignRoleDto): Promise<User> {
    const { userId, roleId } = assignRoleDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }

    if (!user.roles.some((r) => r.id === role.id)) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }

    return user;
  }

  async findAllActiveUsers(): Promise<User[]> {
    try {
      return this.userRepository.find({
        where: { isActive: true },
        relations: ['roles'],
      });
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des utilisateurs actifs:',
        error,
      );
      throw new BadRequestException(
        'Erreur lors de la récupération des utilisateurs actifs',
      );
    }
  }

  async hasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.roles.some((role) =>
      role.permissions.some((permission) => permission.name === permissionName),
    );
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }

  async getRolesByIds(roleIds: number[]): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { id: In(roleIds) },
    });
  }

  async createTemporaryUser(
    createTemporaryUserDto: CreateTemporaryUserDto,
  ): Promise<User> {
    const { email, username, roleId } = createTemporaryUserDto;

    try {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new BadRequestException("Le rôle spécifié n'existe pas");
      }

      const temporaryPassword = this.generatePassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const user = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
        isActive: false,
        roles: [role],
      });

      await this.userRepository.save(user);

      const resetUrl = `http://localhost:3001/reset-password?userId=${user.id}`;

      const subject = 'Rejoindre Employee360 Evaluation';
      const text = `Bonjour ${username},\n\nVoici votre mot de passe temporaire : ${temporaryPassword}\n\nVeuillez l'utiliser pour vous connecter et modifier votre mot de passe.\n\nVous pouvez réinitialiser votre mot de passe en cliquant sur le lien suivant :\n${resetUrl}\n\nCordialement,\nL'équipe Employee360 Evaluation.`;

      const html = `<p>Bonjour ${username},</p>
      <p>Voici votre mot de passe temporaire : <strong>${temporaryPassword}</strong></p>
      <p>Veuillez l'utiliser pour vous connecter et modifier votre mot de passe.</p>
      <p>Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
      <p><a href="${resetUrl}" target="_blank" style="color: blue; font-weight: bold;">Réinitialiser mon mot de passe</a></p>
      <p>Cordialement,</p>
      <p><strong>L'équipe Employee360 Evaluation</strong></p>`;

      await this.emailService.sendEmail(user.email, subject, text, html);

      return user;
    } catch (error) {
      this.logger.error(
        "Erreur lors de la création de l'utilisateur temporaire:",
        error,
      );
      throw new BadRequestException(
        "Erreur lors de la création de l'utilisateur temporaire",
      );
    }
  }

  private generatePassword(length: number = 10): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    return password;
  }

  async ResetPasswordTemporaryUser(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.error(`Utilisateur avec l'ID ${userId} non trouvé`);
        throw new Error('Utilisateur non trouvé');
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error('Mot de passe actuel incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedNewPassword;
      user.isActive = true;

      const updatedUser = await this.userRepository.save(user);

      if (updatedUser.isActive) {
        this.logger.log(`Utilisateur ${userId} activé avec succès`);
      } else {
        this.logger.error(`Échec de l'activation de l'utilisateur ${userId}`);
        throw new Error("Échec de l'activation de l'utilisateur");
      }

      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Erreur lors du changement de mot de passe pour l'utilisateur ${userId}:`,
        error,
      );
      throw error;
    }
  }
}

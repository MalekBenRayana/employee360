import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload.interface';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && bcrypt.compareSync(password, user.password)) {
      if (!user.isActive) {
        throw new UnauthorizedException(
          "Utilisateur désactivé. Veuillez contacter l'administrateur.",
        );
      }

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const roles = user.roles.map((role) => role.name);

    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      roles: roles,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: '1h',
      }),
      username: user.username,
    };
  }
}

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from './jwt.payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub || !payload.username || !payload.roles) {
      throw new Error('Invalid JWT payload');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}

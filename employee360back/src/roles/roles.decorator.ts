// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export function Roles(...roles: string[]) {
  // Le décorateur accepte maintenant un tableau de strings
  return SetMetadata(ROLES_KEY, roles);
}

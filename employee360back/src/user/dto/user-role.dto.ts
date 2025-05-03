import { IsNumber, IsNotEmpty } from 'class-validator';

export class UserRoleDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  role_id: number;
}

import { IsNumber } from 'class-validator';

export class AssignPermissionsDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  roleId: number;
}

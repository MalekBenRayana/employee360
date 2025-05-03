import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProjectRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

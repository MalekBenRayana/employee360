import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProjectRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

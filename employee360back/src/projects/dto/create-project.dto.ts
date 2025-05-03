import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  ValidateNested,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoleDto } from 'src/user/dto/user-role.dto';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  project_name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  priority: string;

  @IsNumber()
  @IsNotEmpty()
  department_id: number;

  @IsNumber()
  @IsNotEmpty()
  manager_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  users: UserRoleDto[];
}

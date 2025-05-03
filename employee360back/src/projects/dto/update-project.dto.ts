import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { UserRoleDto } from 'src/user/dto/user-role.dto';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  project_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  department_id?: number;

  @IsNumber()
  @IsOptional()
  manager_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  @IsOptional()
  users?: UserRoleDto[];
}

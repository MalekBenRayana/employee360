import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  department_name: string;

  @IsInt()
  @IsNotEmpty()
  department_head_id: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayNotEmpty()
  users_ids?: number[];
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './department.entity';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(createDepartmentDto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.departmentsService.remove(id);
  }

  @Post(':departmentId/assign-projects')
  async assignProjectsToDepartment(
    @Param('departmentId') departmentId: number,
    @Body('project_ids') projectIds: number[],
  ) {
    return this.departmentsService.assignProjectsToDepartment(
      departmentId,
      projectIds,
    );
  }

  @Post(':departmentId/assign-users')
  async addUsersToDepartment(
    @Param('departmentId') departmentId: number,
    @Body('users_ids') userIds: number[],
  ): Promise<Department> {
    return this.departmentsService.addUsersToDepartment(departmentId, userIds);
  }
}

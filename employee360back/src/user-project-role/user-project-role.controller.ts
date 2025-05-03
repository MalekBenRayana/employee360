import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserProjectRoleService } from './user-project-role.service';
import { CreateUserProjectRoleDto } from './dto/create-user-project-role.dto';

@Controller('user-project-role')
export class UserProjectRoleController {
  constructor(
    private readonly userProjectRoleService: UserProjectRoleService,
  ) {}

  @Post()
  create(@Body() createUserProjectRoleDto: CreateUserProjectRoleDto) {
    return this.userProjectRoleService.create(createUserProjectRoleDto);
  }

  @Get()
  findAll() {
    return this.userProjectRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userProjectRoleService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userProjectRoleService.remove(+id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PerformancePointTypeService } from './performance-point-type.service';
import { CreatePerformancePointTypeDto } from './dto/create-performance-point-type.dto';
import { UpdatePerformancePointTypeDto } from './dto/update-performance-point-type.dto';

@Controller('performance-point-types')
export class PerformancePointTypeController {
  constructor(
    private readonly performancePointTypeService: PerformancePointTypeService,
  ) {}

  @Post()
  async create(
    @Body() createPerformancePointTypeDto: CreatePerformancePointTypeDto,
  ) {
    return this.performancePointTypeService.create(
      createPerformancePointTypeDto,
    );
  }

  @Get()
  async findAll() {
    return this.performancePointTypeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.performancePointTypeService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePerformancePointTypeDto: UpdatePerformancePointTypeDto,
  ) {
    return this.performancePointTypeService.update(
      +id,
      updatePerformancePointTypeDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.performancePointTypeService.remove(+id);
  }
}

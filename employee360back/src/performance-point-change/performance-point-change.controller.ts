import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PerformancePointChangeService } from './performance-point-change.service';
import { CreatePerformancePointChangeDto } from './dto/create-performance-point-change.dto';
import { UpdatePerformancePointChangeDto } from './dto/update-performance-point-change.dto';

@Controller('performance-point-changes')
export class PerformancePointChangeController {
  constructor(
    private readonly performancePointChangeService: PerformancePointChangeService,
  ) {}

  @Post()
  create(
    @Body() createPerformancePointChangeDto: CreatePerformancePointChangeDto,
  ) {
    return this.performancePointChangeService.create(
      createPerformancePointChangeDto,
    );
  }

  @Get()
  findAll() {
    return this.performancePointChangeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performancePointChangeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePerformancePointChangeDto: UpdatePerformancePointChangeDto,
  ) {
    return this.performancePointChangeService.update(
      +id,
      updatePerformancePointChangeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.performancePointChangeService.remove(+id);
  }
}

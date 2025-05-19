import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskEstimationService } from './task-estimation.service';
import { CreateTaskEstimationDto } from './dto/create-task-estimation.dto';
import { GetTaskEstimationByPeriodDto } from './dto/get-task-estimation-by-period.dto';
import { UpdateTaskEstimationDto } from './dto/update-task-estimation.dto';

@Controller('task-estimations')
export class TaskEstimationController {
  constructor(private readonly taskEstimationService: TaskEstimationService) {}

  @Post()
  async create(
    @Body(new ValidationPipe())
    createTaskEstimationDto: CreateTaskEstimationDto,
  ) {
    return this.taskEstimationService.create(
      createTaskEstimationDto.userId,
      createTaskEstimationDto,
    );
  }

  @Get()
  async findAll() {
    return this.taskEstimationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskEstimationService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe())
    updateTaskEstimationDto: UpdateTaskEstimationDto,
  ) {
    return this.taskEstimationService.update(id, updateTaskEstimationDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.taskEstimationService.delete(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.taskEstimationService.findByUserId(userId);
  }

  @Get('user/:userId/period')
  async findByUserIdAndPeriod(
    @Param('userId', ParseIntPipe) userId: number,
    @Query(new ValidationPipe()) query: GetTaskEstimationByPeriodDto,
  ) {
    return this.taskEstimationService.findByUserIdAndPeriod(
      userId,
      query.periodStart,
      query.periodEnd,
    );
  }
}

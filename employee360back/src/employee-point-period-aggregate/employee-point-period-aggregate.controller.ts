import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { EmployeePointPeriodAggregateService } from './employee-point-period-aggregate.service';
import { CreateEmployeePointPeriodAggregateDto } from './dto/create-employee-point-period-aggregate.dto';
import { UpdateEmployeePointPeriodAggregateDto } from './dto/update-employee-point-period-aggregate.dto';

@Controller('employee-point-period-aggregates')
export class EmployeePointPeriodAggregateController {
  constructor(
    private readonly employeePointPeriodAggregateService: EmployeePointPeriodAggregateService,
  ) {}

  @Post()
  create(
    @Body()
    createEmployeePointPeriodAggregateDto: CreateEmployeePointPeriodAggregateDto,
  ) {
    return this.employeePointPeriodAggregateService.create(
      createEmployeePointPeriodAggregateDto,
    );
  }

  @Get()
  findAll() {
    return this.employeePointPeriodAggregateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeePointPeriodAggregateService.findOne(+id);
  }

  @Get('user/:userId')
  findByUserAndPeriod(
    @Param('userId') userId: string,
    @Query('period') period: string,
  ) {
    if (!period) {
      return this.employeePointPeriodAggregateService.findAllByEvaluatee(
        +userId,
      );
    }
    return this.employeePointPeriodAggregateService.findAllByEvaluateeAndPeriod(
      +userId,
      period,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateEmployeePointPeriodAggregateDto: UpdateEmployeePointPeriodAggregateDto,
  ) {
    return this.employeePointPeriodAggregateService.update(
      +id,
      updateEmployeePointPeriodAggregateDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeePointPeriodAggregateService.remove(+id);
  }
}

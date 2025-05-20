import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTracking } from './time-tracking.entity';
import { ExternalTimeTrackingInputDto } from './dto/external-time-tracking-input.dto';

@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() timeTrackingData: Partial<TimeTracking>,
  ): Promise<TimeTracking> {
    return this.timeTrackingService.create(timeTrackingData);
  }

  @Get()
  async findAll(): Promise<TimeTracking[]> {
    return this.timeTrackingService.findAll();
  }

  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<TimeTracking[]> {
    return this.timeTrackingService.findByUserId(+userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TimeTracking> {
    return this.timeTrackingService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() timeTrackingData: Partial<TimeTracking>,
  ): Promise<TimeTracking> {
    return this.timeTrackingService.update(id, timeTrackingData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.timeTrackingService.remove(id);
  }

  @Post('external-time-tracking')
  @UsePipes(new ValidationPipe())
  async processExternalTimeTracking(
    @Body() externalTimeTrackingInput: ExternalTimeTrackingInputDto,
  ): Promise<TimeTracking[]> {
    return this.timeTrackingService.processExternalTimeTracking(
      externalTimeTrackingInput.data,
    );
  }

  @Get('by-username/:username')
  async findByUserName(
    @Param('username') username: string,
  ): Promise<TimeTracking[]> {
    if (!username) {
      throw new BadRequestException(
        "Le paramètre username est requis dans l'URL.",
      );
    }
    return this.timeTrackingService.findByUserName(username);
  }

  @Get('total-retards')
  async getTotalRetards(): Promise<{ total: number }> {
    const total = await this.timeTrackingService.getTotalRetards();
    return { total };
  }

  @Get('total-heures-requises')
  async getTotalHeuresRequises(): Promise<{ total: number }> {
    const total = await this.timeTrackingService.getTotalHeuresRequises();
    return { total };
  }

  @Get('team-stats/:managerId')
  async getTeamStats(
    @Param('managerId', ParseIntPipe) managerId: number,
  ): Promise<any> {
    try {
      return await this.timeTrackingService.getTeamTimeTrackingAndTaskEstimationStats(
        managerId,
      );
    } catch (error) {
      throw error;
    }
  }
}

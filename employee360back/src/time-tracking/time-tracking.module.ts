// time-tracking/time-tracking.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTracking } from './time-tracking.entity';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { User } from 'src/user/user.entity';
import { TaskEstimationModule } from 'src/tasks-estimations/tasks-estimations.module';
import { Project } from 'src/projects/project.entity';
import { TaskEstimation } from 'src/tasks-estimations/task-estimation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTracking, User, Project, TaskEstimation]),
    TaskEstimationModule,
  ],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
})
export class TimeTrackingModule {}

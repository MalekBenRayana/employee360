// time-tracking/time-tracking.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTracking } from './time-tracking.entity';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTracking, User])],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
})
export class TimeTrackingModule {}

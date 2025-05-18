import { Module } from '@nestjs/common';
import { TaskEstimationService } from './task-estimation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEstimation } from './task-estimation.entity';
import { User } from 'src/user/user.entity';
import { TaskEstimationController } from './task-estimation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEstimation, User])],
  controllers: [TaskEstimationController],
  providers: [TaskEstimationService],
  exports: [TaskEstimationService],
})
export class TaskEstimationModule {}

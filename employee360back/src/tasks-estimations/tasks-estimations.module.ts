// tasks-estimations/tasks-estimations.module.ts
import { Module } from '@nestjs/common';
import { TaskEstimationService } from './task-estimation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { TaskEstimationController } from './task-estimation.controller';
import { TaskEstimation } from './task-estimation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEstimation, User])],
  controllers: [TaskEstimationController],
  providers: [TaskEstimationService],
  exports: [TypeOrmModule], // Exportez TypeOrmModule ici
})
export class TaskEstimationModule {}

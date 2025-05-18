import { Module } from '@nestjs/common';
import { PerformancePointChangeService } from './performance-point-change.service';
import { PerformancePointChangeController } from './performance-point-change.controller';
import { PerformancePointChange } from './performance-point-change.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PerformancePointChange])],
  providers: [PerformancePointChangeService],
  controllers: [PerformancePointChangeController],
  exports: [
    PerformancePointChangeService,
    TypeOrmModule.forFeature([PerformancePointChange]),
  ],
})
export class PerformancePointChangeModule {}

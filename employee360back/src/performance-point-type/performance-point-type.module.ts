import { Module } from '@nestjs/common';
import { PerformancePointTypeService } from './performance-point-type.service';
import { PerformancePointTypeController } from './performance-point-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformancePointType } from './performance-point-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformancePointType])],
  providers: [PerformancePointTypeService],
  controllers: [PerformancePointTypeController],
  exports: [PerformancePointTypeService, TypeOrmModule],
})
export class PerformancePointTypeModule {}

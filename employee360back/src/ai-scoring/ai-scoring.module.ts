import { Module } from '@nestjs/common';
import { AiScoringService } from './ai-scoring.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [AiScoringService],
  exports: [AiScoringService],
})
export class AiScoringModule {}

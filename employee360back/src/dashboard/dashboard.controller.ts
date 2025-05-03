import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('evaluatee/:evaluateeId/stats')
  async getEvaluateeStats(@Param('evaluateeId') evaluateeId: number) {
    return this.dashboardService.calculateEvaluateeStats(evaluateeId);
  }

  @Get('evaluatee/:evaluateeId/score-history')
  async getEvaluateeScoreHistory(@Param('evaluateeId') evaluateeId: number) {
    return this.dashboardService.getEvaluateeScoreHistory(evaluateeId);
  }
}

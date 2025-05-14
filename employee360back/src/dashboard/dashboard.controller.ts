import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

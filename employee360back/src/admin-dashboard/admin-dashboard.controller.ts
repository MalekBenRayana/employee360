import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { User } from 'src/user/user.entity';
import { PerformancePointChange } from 'src/performance-point-change/performance-point-change.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.entity';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('total-employees')
  async getTotalEmployees(): Promise<number> {
    return this.adminDashboardService.getTotalEmployees();
  }

  @Get('total-performance-point-types')
  async getTotalPerformancePointTypes(): Promise<number> {
    return this.adminDashboardService.getTotalPerformancePointTypes();
  }

  @Get('total-evaluations')
  async getTotalEvaluations(): Promise<number> {
    return this.adminDashboardService.getTotalEvaluations();
  }

  @Get('evaluations-current-period')
  async getEvaluationsCurrentPeriod(): Promise<number> {
    return this.adminDashboardService.getEvaluationsCurrentPeriod();
  }

  @Get('average-overall-score-current-period')
  async getAverageOverallScoreCurrentPeriod(): Promise<number> {
    return this.adminDashboardService.getAverageOverallScoreCurrentPeriod();
  }

  @Get('average-scores-by-performance-point-current-period')
  async getAverageScoresByPerformancePointCurrentPeriod(): Promise<{
    [key: string]: number;
  }> {
    return this.adminDashboardService.getAverageScoresByPerformancePointCurrentPeriod();
  }

  @Get('employees-without-evaluation-current-period')
  async getEmployeesWithoutEvaluationCurrentPeriod(): Promise<number> {
    return this.adminDashboardService.getEmployeesWithoutEvaluationCurrentPeriod();
  }

  @Get('average-overall-score-trend')
  async getAverageOverallScoreTrend(
    @Query('numberOfPeriods') numberOfPeriods: string = '5',
  ): Promise<{ period: string; averageScore: number }[]> {
    return this.adminDashboardService.getAverageOverallScoreTrend(
      parseInt(numberOfPeriods, 10),
    );
  }

  @Get('evaluations-trend')
  async getEvaluationsTrend(
    @Query('numberOfPeriods') numberOfPeriods: string = '5',
  ): Promise<{ period: string; numberOfEvaluations: number }[]> {
    return this.adminDashboardService.getEvaluationsTrend(
      parseInt(numberOfPeriods, 10),
    );
  }

  @Get('employee-score-distribution-current-period')
  async getEmployeeScoreDistributionCurrentPeriod(): Promise<
    { range: string; count: number }[]
  > {
    return this.adminDashboardService.getEmployeeScoreDistributionCurrentPeriod();
  }

  @Get('performance-point-score-trend')
  async getPerformancePointScoreTrend(
    @Query('numberOfPeriods') numberOfPeriods: string = '5',
  ): Promise<
    {
      pointTypeName: string;
      trend: { period: string; averageScore: number }[];
    }[]
  > {
    return this.adminDashboardService.getPerformancePointScoreTrend(
      parseInt(numberOfPeriods, 10),
    );
  }

  @Get('evaluations-in-progress')
  async getEvaluationsInProgress(): Promise<number> {
    return this.adminDashboardService.getEvaluationsInProgress();
  }

  @Get('performance-point-participation-rate')
  async getPerformancePointParticipationRate(): Promise<
    { pointTypeName: string; participationRate: number }[]
  > {
    return this.adminDashboardService.getPerformancePointParticipationRate();
  }

  @Get('evaluation-completion-rate-current-period')
  async getEvaluationCompletionRateCurrentPeriod(): Promise<number> {
    return this.adminDashboardService.getEvaluationCompletionRateCurrentPeriod();
  }

  @Get('evaluations-late-current-period')
  async getEvaluationsLateCurrentPeriod(): Promise<number> {
    return this.adminDashboardService.getEvaluationsLateCurrentPeriod();
  }

  @Get('average-completion-time-current-period')
  async getAverageCompletionTimeCurrentPeriod(): Promise<string> {
    return this.adminDashboardService.getAverageCompletionTimeCurrentPeriod();
  }

  @Get('employees/search')
  async searchEmployees(@Query('query') query: string): Promise<any[]> {
    // Utilisez 'any[]' ou une interface appropriée
    return this.adminDashboardService.searchEmployees(query);
  }
  @Get('employees')
  async getAllEmployees(): Promise<User[]> {
    return this.adminDashboardService.getAllEmployees();
  }

  @Get('employees/:employeeId/history')
  async getEmployeeHistory(@Param('employeeId') employeeId: string): Promise<{
    evaluations: any[];
    performancePoints: any[];
    aggregateScores: any[];
    employee: any;
  }> {
    return this.adminDashboardService.getEmployeeHistory(
      parseInt(employeeId, 10),
    );
  }

  @Get('evaluatee/:id/project-scores')
  async getEvaluateeProjectScores(@Param('id') id: string) {
    return this.adminDashboardService.getScorePerProjectByUser(
      parseInt(id, 10),
    );
  }

  @Get('employees/:employeeId/performance-points')
  async getEmployeePerformancePoints(
    @Param('employeeId') employeeId: string,
  ): Promise<PerformancePointChange[]> {
    return this.adminDashboardService.getEmployeePerformancePoints(
      parseInt(employeeId, 10),
    );
  }

  @Get('employees/:employeeId/project-performance-scores')
  async getEmployeeProjectPerformanceScores(
    @Param('employeeId') employeeId: string,
  ): Promise<
    {
      projectId: number;
      projectName: string;
      performancePointName: string;
      score: number | null;
    }[]
  > {
    return this.adminDashboardService.getScoresByPerformancePointAndProjectForEmployee(
      parseInt(employeeId, 10),
    );
  }

  @Get('projects/:projectId/team-stats')
  @Roles('admin', 'manager') // Utilisez les noms des rôles (chaînes de caractères)
  async getTeamEmployeeStatsForProject(
    @Param('projectId') projectId: string,
    @Query('managerId') managerId?: string,
  ): Promise<
    {
      employeeId: number;
      username: string;
      email: string;
      averageScore: number | null;
      numberOfEvaluations: number;
      totalPerformancePoints: number;
      projectAverageScore: number | null;
      projectAveragePerformancePointScore: number | null;
      averageScoresByPerformancePoint: {
        [pointName: string]: number | null;
      };
    }[]
  > {
    const projectIdNumber = parseInt(projectId, 10);
    const managerIdNumber = managerId ? parseInt(managerId, 10) : undefined;
    return this.adminDashboardService.getTeamEmployeeStatsForProject(
      managerIdNumber,
      projectIdNumber,
    );
  }



}

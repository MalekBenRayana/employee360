// src/team-ai-report/team-ai-report.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query, // Import Query
  NotFoundException,
} from '@nestjs/common';
import { TeamAiReportService } from './team-ai-report.service';

@Controller('team-ai-reports')
export class TeamAiReportController {
  constructor(private readonly teamAiReportService: TeamAiReportService) {}

  /**
   * Endpoint to get the global AI report for all team members in a given project.
   *
   * @param managerId The ID of the manager (passed as a query parameter)
   * @param projectId The ID of the project
   * @returns An array of objects containing the global AI report for each team member.
   */
  @Get('project/:projectId')
  async getTeamGlobalAiReportForProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('managerId', ParseIntPipe) managerId: number,
  ) {
    if (!managerId) {
      throw new NotFoundException('Manager ID is required as a query parameter (e.g., ?managerId=1).');
    }

    return this.teamAiReportService.getGlobalTeamAiReportForProject(
      managerId,
      projectId,
    );
  }
}
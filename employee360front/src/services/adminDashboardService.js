import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/admin/dashboard';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const getTotalEmployees = async () => {
  try {
    const response = await api.get('/total-employees');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du total des employés:", error);
    throw error;
  }
};

const getTotalPerformancePointTypes = async () => {
  try {
    const response = await api.get('/total-performance-point-types');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du total des types de points:", error);
    throw error;
  }
};

const getTotalEvaluations = async () => {
  try {
    const response = await api.get('/total-evaluations');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du total des évaluations:", error);
    throw error;
  }
};

const getEvaluationsCurrentPeriod = async () => {
  try {
    const response = await api.get('/evaluations-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations de la période actuelle:", error);
    throw error;
  }
};

const getAverageOverallScoreCurrentPeriod = async () => {
  try {
    const response = await api.get('/average-overall-score-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du score moyen actuel:", error);
    throw error;
  }
};

const getAverageScoresByPerformancePointCurrentPeriod = async () => {
  try {
    const response = await api.get('/average-scores-by-performance-point-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des scores moyens par type de point:", error);
    throw error;
  }
};

const getEmployeesWithoutEvaluationCurrentPeriod = async () => {
  try {
    const response = await api.get('/employees-without-evaluation-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés sans évaluation:", error);
    throw error;
  }
};

const getAverageOverallScoreTrend = async (numberOfPeriods = 5) => {
  try {
    const response = await api.get(`/average-overall-score-trend?numberOfPeriods=${numberOfPeriods}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la tendance du score moyen:", error);
    throw error;
  }
};

const getEvaluationsTrend = async (numberOfPeriods = 5) => {
  try {
    const response = await api.get(`/evaluations-trend?numberOfPeriods=${numberOfPeriods}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la tendance des évaluations:", error);
    throw error;
  }
};

const getEmployeeScoreDistributionCurrentPeriod = async () => {
  try {
    const response = await api.get('/employee-score-distribution-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la distribution des scores:", error);
    throw error;
  }
};

const getPerformancePointScoreTrend = async (numberOfPeriods = 5) => {
  try {
    const response = await api.get(`/performance-point-score-trend?numberOfPeriods=${numberOfPeriods}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la tendance des scores par type de point:", error);
    throw error;
  }
};

const getEvaluationsInProgress = async () => {
  try {
    const response = await api.get('/evaluations-in-progress');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations en cours:", error);
    throw error;
  }
};

const getPerformancePointParticipationRate = async () => {
  try {
    const response = await api.get('/performance-point-participation-rate');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du taux de participation par type de point:", error);
    throw error;
  }
};

const getEvaluationCompletionRateCurrentPeriod = async () => {
  try {
    const response = await api.get('/evaluation-completion-rate-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du taux de complétion des évaluations:", error);
    throw error;
  }
};

const getEvaluationsLateCurrentPeriod = async () => {
  try {
    const response = await api.get('/evaluations-late-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations en retard:", error);
    throw error;
  }
};

const getAverageCompletionTimeCurrentPeriod = async () => {
  try {
    const response = await api.get('/average-completion-time-current-period');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du temps moyen de complétion:", error);
    throw error;
  }
};

const searchEmployees = async (query) => {
  try {
    const response = await api.get(`/employees/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche des employés:", error);
    throw error;
  }
};

const getEmployeeHistory = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/history`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique de l'employé ${employeeId}:`, error);
    throw error;
  }
};

const getTotalEmployeesWithDetails = async () => {
  try {
    const response = await api.get('/employees');
    return response.data; 
  } catch (error) {
    console.error("Erreur lors de la récupération des détails des employés:", error);
    throw error;
  }
};

const getScorePerProjectByUser = async (evaluateeId) => {
  try {
    const response = await api.get(`/evaluatee/${evaluateeId}/project-scores`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des scores par projet pour l'évalué ${evaluateeId}:`, error);
    throw error;
  }
};

const getEmployeeProjectPerformanceScores = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/project-performance-scores`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des scores par projet et point pour l'employé ${employeeId}:`, error);
    throw error;
  }
};

const getTeamEmployeeStatsForProject = async (projectId, managerId) => {
  try {
    const response = await api.get(`/projects/${projectId}/team-stats`, {
      params: { managerId },
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques de l'équipe pour le projet ${projectId}:`, error);
    throw error;
  }
};

const adminDashboardService = {
  getTotalEmployees,
  getTotalPerformancePointTypes,
  getTotalEvaluations,
  getEvaluationsCurrentPeriod,
  getAverageOverallScoreCurrentPeriod,
  getAverageScoresByPerformancePointCurrentPeriod,
  getEmployeesWithoutEvaluationCurrentPeriod,
  getAverageOverallScoreTrend,
  getEvaluationsTrend,
  getEmployeeScoreDistributionCurrentPeriod,
  getPerformancePointScoreTrend,
  getEvaluationsInProgress,
  getPerformancePointParticipationRate,
  getEvaluationCompletionRateCurrentPeriod,
  getEvaluationsLateCurrentPeriod,
  getAverageCompletionTimeCurrentPeriod,
  searchEmployees,
  getEmployeeHistory,
  getTotalEmployeesWithDetails,
  getScorePerProjectByUser,
  getEmployeeProjectPerformanceScores,
  getTeamEmployeeStatsForProject,
};

export default adminDashboardService;
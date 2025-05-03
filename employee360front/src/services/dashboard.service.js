import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const getEvaluateeStats = async (evaluateeId) => {
 try {
  const response = await axios.get(`${API_BASE_URL}/dashboard/evaluatee/${evaluateeId}/stats`);
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
  throw error;
 }
};

const getEvaluateeScoreHistory = async (evaluateeId) => {
 try {
  const response = await axios.get(`${API_BASE_URL}/dashboard/evaluatee/${evaluateeId}/score-history`);
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la récupération de l\'historique des scores:', error);
  throw error;
 }
};

const dashboardService = {
 getEvaluateeStats,
 getEvaluateeScoreHistory,
};

export default dashboardService;
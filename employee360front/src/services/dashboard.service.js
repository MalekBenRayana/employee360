// dashboardService.js
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

const getProjectPerformanceScores = async (employeeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard/employees/${employeeId}/project-performance-scores`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des scores de performance par projet:', error);
        throw error;
    }
};

// Nouvelle fonction pour récupérer l'historique complet (incluant les évaluations)
const getEvaluateeFullHistory = async (employeeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard/employees/${employeeId}/history`); // Utilise la même API que EmployeeHistory
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique complet de l'évalué", error);
        throw error;
    }
};

const dashboardService = {
    getEvaluateeStats,
    getEvaluateeScoreHistory,
    getProjectPerformanceScores,
    getEvaluateeFullHistory, // Ajout de la nouvelle fonction
};

export default dashboardService;
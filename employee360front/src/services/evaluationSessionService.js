import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const fetchEvaluationForms = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/evaluation-forms`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des formulaires:', error);
        throw error;
    }
};

const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error;
    }
};

const fetchProjects = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/projects`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        throw error;
    }
};

const createEvaluationSession = async (sessionData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/evaluation-sessions`, sessionData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la session d\'évaluation:', error);
        throw error;
    }
};

const fetchEvaluationSessions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/evaluation-sessions`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions d\'évaluation:', error);
        throw error;
    }
};

const deleteEvaluationSession = async (sessionId) => {
    try {
        await axios.delete(`${API_BASE_URL}/evaluation-sessions/${sessionId}`);
    } catch (error) {
        console.error(`Erreur lors de la suppression de la session avec l'ID ${sessionId}:`, error);
        throw error;
    }
};

export { fetchEvaluationForms, fetchUsers, fetchProjects, createEvaluationSession, deleteEvaluationSession, fetchEvaluationSessions };
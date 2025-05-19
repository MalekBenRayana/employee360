import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const timeTrackingService = {
  async getAllRetards() {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-tracking`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des retards:', error);
      throw error;
    }
  },

  async getRetardsByUserId(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-tracking/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des retards pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  async getRetardsByUser(username) {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-tracking/by-username/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des retards pour l'utilisateur ${username}:`, error);
      throw error;
    }
  },

  async getTeamStats(managerId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-tracking/team-stats/${managerId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des statistiques de l'équipe pour le manager ${managerId}:`,
        error,
      );
      throw error;
    }
  },
};

export default timeTrackingService;
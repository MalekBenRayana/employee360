import axios from 'axios';
import { getUserIdFromToken } from '../utils/tokenUtils';

const API_BASE_URL = 'http://localhost:3000/notifications';

const notificationService = {
  /**
   * @param {string} message
   * @returns {Promise<any>}
   */
  async createNotification(message: string) {
    try {
      const userId = getUserIdFromToken();
      const response = await axios.post(API_BASE_URL, { userId, message });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error.response?.data || { message: 'Erreur lors de la création de la notification' };
    }
  },

  /**
   * @param {string} userId 
   * @returns {Promise<any>} 
   */
  async getUserNotifications(userId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des notifications de l'utilisateur ${userId}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des notifications' };
    }
  },

  /**
   * @param {number} id 
   * @returns {Promise<any>}
   */
  async markNotificationAsRead(id: number) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage de la notification ${id} comme lue:`, error);
      throw error.response?.data || { message: 'Erreur lors du marquage de la notification comme lue' };
    }
  },
  async sendGlobalNotification(message: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/global`, { message });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification globale", error);
      throw error.response?.data || { message: "Erreur lors de l'envoi de la notification globale" };
    }
  }
};

export default notificationService;

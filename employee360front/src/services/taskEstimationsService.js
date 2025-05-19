import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const taskEstimationsApi = axios.create({
  baseURL: API_BASE_URL,
});

const getAllTaskEstimations = async () => {
  try {
    const response = await taskEstimationsApi.get('/task-estimations');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les estimations de tâches:", error);
    throw error;
  }
};

const getTaskEstimationById = async (id) => {
  try {
    const response = await taskEstimationsApi.get(`/task-estimations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'estimation de tâche avec l'ID ${id}:`, error);
    throw error;
  }
};

const updateTaskEstimation = async (id, taskEstimationData) => {
  try {
    const response = await taskEstimationsApi.put(`/task-estimations/${id}`, taskEstimationData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'estimation de tâche avec l'ID ${id}:`, error);
    throw error;
  }
};

const deleteTaskEstimation = async (id) => {
  try {
    const response = await taskEstimationsApi.delete(`/task-estimations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'estimation de tâche avec l'ID ${id}:`, error);
    throw error;
  }
};

const getTaskEstimationsByUserId = async (userId) => {
  try {
    const response = await taskEstimationsApi.get(`/task-estimations/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des estimations de tâches pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

const getTaskEstimationsByUserIdAndPeriod = async (userId, periodStart, periodEnd) => {
  try {
    const response = await taskEstimationsApi.get(`/task-estimations/user/${userId}/period`, {
      params: { periodStart, periodEnd },
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des estimations de tâches pour l'utilisateur ${userId} et la période spécifiée:`, error);
    throw error;
  }
};

const taskEstimationsService = {
  getAllTaskEstimations,
  getTaskEstimationById,
  updateTaskEstimation,
  deleteTaskEstimation,
  getTaskEstimationsByUserId,
  getTaskEstimationsByUserIdAndPeriod,
};

export default taskEstimationsService;
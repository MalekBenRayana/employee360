import axios from 'axios';

const apiUrl = 'http://localhost:3000/projects';

export const createProject = async (projectData) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.post(apiUrl, projectData, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la création du projet:', error.message);
  throw new Error('Erreur lors de la création du projet');
 }
};

export const getAllProjects = async () => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.get(apiUrl, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la récupération des projets:', error.message);
  throw new Error('Erreur lors de la récupération des projets');
 }
};

export const getProjectById = async (projectId) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.get(`${apiUrl}/${projectId}`, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la récupération du projet:', error.message);
  throw new Error('Erreur lors de la récupération du projet');
 }
};

export const updateProject = async (projectId, projectData) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.put(`${apiUrl}/${projectId}`, projectData, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la mise à jour du projet:', error.message);
  throw new Error('Erreur lors de la mise à jour du projet');
 }
};

export const deleteProject = async (projectId) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.delete(`${apiUrl}/${projectId}`, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la suppression du projet:', error.message);
  throw new Error('Erreur lors de la suppression du projet');
 }
};

export const assignUserToProject = async (projectId, userId) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.post(`${apiUrl}/${projectId}/assign/${userId}`, {}, { // Body vide pour un simple assignation
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de l\'assignation de l\'utilisateur au projet:', error.message);
  throw new Error('Erreur lors de l\'assignation de l\'utilisateur au projet');
 }
};

export const getProjectsByUser = async (userId) => {
 try {
  const token = localStorage.getItem('access_token');
  if (!token) {
   throw new Error('Token manquant');
  }
  const response = await axios.get(`${apiUrl}/user/${userId}`, {
   headers: {
    Authorization: `Bearer ${token}`,
   },
  });
  return response.data;
 } catch (error) {
  console.error('Erreur lors de la récupération des projets de l\'utilisateur:', error.message);
  throw new Error('Erreur lors de la récupération des projets de l\'utilisateur');
 }
};
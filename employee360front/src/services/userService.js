import axios from 'axios';

const apiUrl = 'http://localhost:3000/users';

export const getUsers = async () => {
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
    console.error('Erreur lors de la récupération des utilisateurs:', error.message);
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
};

export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await axios.get(`${apiUrl}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
    throw new Error('Erreur lors de la récupération de l\'utilisateur');
  }
};

export const updateUser = async (userId, updatedUser) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await axios.patch(`${apiUrl}/${userId}`, updatedUser, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
  }
};

export const reactivateUser = async (userId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await axios.patch(`${apiUrl}/reactivate/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur:', error.message);
    throw new Error('Erreur lors de la réactivation de l\'utilisateur');
  }
};

export const deactivateUser = async (userId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await axios.patch(`${apiUrl}/deactivate/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error.message);
    throw new Error('Erreur lors de la désactivation de l\'utilisateur');
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await axios.delete(`${apiUrl}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error.message);
    throw new Error('Erreur lors de la suppression de l\'utilisateur');
  }
};

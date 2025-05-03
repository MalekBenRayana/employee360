import axios from "axios";

const API_URL = "http://localhost:3000";


export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    throw new Error("Erreur lors de la connexion");
  }
};


export const fetchUserRole = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/role`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des infos utilisateur");
  }
};

export const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Erreur lors de l'inscription" };
    }
  };


export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");
};

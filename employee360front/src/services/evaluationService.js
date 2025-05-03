import axios from 'axios';


const API_URL = 'http://localhost:3000'; 



export const getEvaluationForms = async () => {
  try {
    const response = await axios.get(`${API_URL}/evaluation-forms`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    throw error;
  }
};


export const getEvaluationFormById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/evaluation-forms/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    throw error;
  }
};


export const submitEvaluationResponse = async (formId, responses) => {
  try {
    const response = await axios.post(`${API_URL}/evaluation-forms/${formId}/responses`, responses);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi des réponses:', error);
    throw error;
  }
};

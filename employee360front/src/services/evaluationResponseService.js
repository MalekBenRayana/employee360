import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const fetchFormToRespond = async (formId, sessionId, evaluatorId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/evaluation-forms/respond/${formId}`,
            { params: { sessionId, evaluatorId } }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du formulaire à répondre:', error);
        throw error;
    }
};

const submitResponse = async (submissionData) => {
    try {
        await axios.post(`${API_BASE_URL}/evaluation-responses`, submissionData);
    } catch (error) {
        console.error('Erreur lors de la soumission de la réponse:', error);
        throw error;
    }
};

const fetchResponseDetail = async (responseId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/evaluation-responses/${responseId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du détail de la réponse:', error);
        throw error;
    }
};

const fetchResponsesByFormId = async (formId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/evaluation-forms/${formId}/responses`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des réponses pour le formulaire:', error);
        throw error;
    }
};

export { fetchFormToRespond, submitResponse, fetchResponseDetail  , fetchResponsesByFormId};
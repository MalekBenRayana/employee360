import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/evaluation-forms';

const fetchForms = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des formulaires:', error);
        throw error;
    }
};

const fetchForm = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors du chargement du formulaire:', error);
        throw error;
    }
};

const saveForm = async (formData, id = null) => {
    try {
        if (id) {
            await axios.put(`${API_BASE_URL}/${id}`, formData);
        } else {
            await axios.post(API_BASE_URL, formData);
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du formulaire:', error);
        throw error;
    }
};

const deleteForm = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error('Erreur lors de la suppression du formulaire:', error);
        throw error;
    }
};

export { fetchForms, fetchForm, saveForm, deleteForm };
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/formulas';

export const getAllFormulas = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des formules:", error);
        throw error;
    }
};

export const getFormulaById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la formule avec l'ID ${id}:`, error);
        throw error;
    }
};

export const createFormula = async (formulaData) => {
    try {
        const response = await axios.post(API_BASE_URL, formulaData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de la formule:", error);
        throw error;
    }
};

export const updateFormula = async (id, formulaData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}`, formulaData);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la formule avec l'ID ${id}:`, error);
        throw error;
    }
};

export const deleteFormula = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de la formule avec l'ID ${id}:`, error);
        throw error;
    }
};
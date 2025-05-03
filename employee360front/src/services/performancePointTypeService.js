import axios from 'axios';

const API_URL = 'http://localhost:3000/performance-point-types';

export const getAll = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching performance point types:", error);
        throw error;
    }
};
export const getById = (id) => axios.get(`${API_URL}/${id}`);
export const create = (data) => axios.post(API_URL, data);
export const update = (id, data) => axios.patch(`${API_URL}/${id}`, data);
export const remove = (id) => axios.delete(`${API_URL}/${id}`);
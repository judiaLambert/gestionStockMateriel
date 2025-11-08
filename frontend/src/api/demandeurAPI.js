import axios from 'axios';
const API_URL = 'http://localhost:3000/demandeur';

export const getDemandeurs = () => axios.get(API_URL);
export const addDemandeur = (data) => axios.post(API_URL, data);
export const updateDemandeur = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteDemandeur = (id) => axios.delete(`${API_URL}/${id}`);

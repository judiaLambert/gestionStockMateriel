import axios from 'axios';

const API_URL = 'http://localhost:3000/detail-demande';

export const getDetailDemandes = () => axios.get(API_URL);
export const getDetailDemande = (id) => axios.get(`${API_URL}/${id}`);
export const addDetailDemande = (data) => axios.post(API_URL, data);
export const updateDetailDemande = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteDetailDemande = (id) => axios.delete(`${API_URL}/${id}`);
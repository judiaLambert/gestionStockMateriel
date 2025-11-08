import axios from 'axios';

const BASE_URL = 'http://localhost:3000/acquisition';

// ===== Acquisition =====
export const getAcquisitions = () => axios.get(`${BASE_URL}`);
export const getAcquisitionsByFournisseur = (fournisseurId) => axios.get(`${BASE_URL}/fournisseur/${fournisseurId}`);
export const addAcquisition = (data) => axios.post(`${BASE_URL}`, data);
export const updateAcquisition = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteAcquisition = (id) => axios.delete(`${BASE_URL}/${id}`);
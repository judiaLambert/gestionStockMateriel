import axios from 'axios';

const BASE_URL = 'http://localhost:3000/approvisionnement';

// ===== Approvisionnement =====
export const getApprovisionnements = () => axios.get(`${BASE_URL}`);
export const getApprovisionnementsByAcquisition = (acquisitionId) => axios.get(`${BASE_URL}/acquisition/${acquisitionId}`);
export const addApprovisionnement = (data) => axios.post(`${BASE_URL}`, data);
export const updateApprovisionnement = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteApprovisionnement = (id) => axios.delete(`${BASE_URL}/${id}`);
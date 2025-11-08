import axios from 'axios';

const BASE_URL = 'http://localhost:3000/detail-approvisionnement';

// ===== DetailApprovisionnement =====
export const getDetailApprovisionnements = () => axios.get(`${BASE_URL}`);
export const getDetailApprovisionnementsByAppro = (approId) => axios.get(`${BASE_URL}/approvisionnement/${approId}`);
export const getStatsByApprovisionnement = (approId) => axios.get(`${BASE_URL}/stats/${approId}`);
export const addDetailApprovisionnement = (data) => axios.post(`${BASE_URL}`, data);
export const updateDetailApprovisionnement = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteDetailApprovisionnement = (id) => axios.delete(`${BASE_URL}/${id}`);
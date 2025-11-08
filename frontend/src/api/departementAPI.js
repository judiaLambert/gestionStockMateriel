import axios from 'axios';

const BASE_URL = 'http://localhost:3000/departement';

// ===== Departement =====
export const getDepartements = () => axios.get(`${BASE_URL}`);
export const addDepartement = (data) => axios.post(`${BASE_URL}`, data);
export const updateDepartement = (idDepartement, data) => axios.put(`${BASE_URL}/${idDepartement}`, data);
export const deleteDepartement = (idDepartement) => axios.delete(`${BASE_URL}/${idDepartement}`);
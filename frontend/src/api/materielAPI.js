import axios from 'axios';

const BASE_URL = 'http://localhost:3000/materiel';

// ===== Materiel =====
export const getMateriels = () => axios.get(`${BASE_URL}`);
export const getMaterielsByEtat = (etatId) => axios.get(`${BASE_URL}/etat/${etatId}`);
export const getMaterielsByType = (typeId) => axios.get(`${BASE_URL}/type/${typeId}`);
export const addMateriel = (data) => axios.post(`${BASE_URL}`, data);
export const updateMateriel = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteMateriel = (id) => axios.delete(`${BASE_URL}/${id}`);
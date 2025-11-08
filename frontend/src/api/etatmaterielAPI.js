import axios from 'axios';

const BASE_URL = 'http://localhost:3000/etat-materiel';

// ===== EtatMateriel =====
export const getEtatsMateriel = () => axios.get(`${BASE_URL}`);
export const addEtatMateriel = (data) => axios.post(`${BASE_URL}`, data);
export const updateEtatMateriel = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteEtatMateriel = (id) => axios.delete(`${BASE_URL}/${id}`);
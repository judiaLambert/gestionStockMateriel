import axios from 'axios';

const BASE_URL = 'http://localhost:3000/fournisseur';

// ===== Fournisseur =====
export const getFournisseurs = () => axios.get(`${BASE_URL}`);
export const getFournisseursGroupes = () => axios.get(`${BASE_URL}/groupes`);
export const addFournisseur = (data) => axios.post(`${BASE_URL}`, data);
export const updateFournisseur = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteFournisseur = (id) => axios.delete(`${BASE_URL}/${id}`);
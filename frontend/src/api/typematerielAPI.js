import axios from 'axios';

const BASE_URL = 'http://localhost:3000/type-materiel';

// ===== TypeMateriel =====
export const getTypesMateriel = () => axios.get(`${BASE_URL}`);
export const addTypeMateriel = (data) => axios.post(`${BASE_URL}`, data);
export const updateTypeMateriel = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteTypeMateriel = (id) => axios.delete(`${BASE_URL}/${id}`);
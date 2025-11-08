import axios from 'axios';

const API_URL = 'http://localhost:3000/mouvement-stock';

export const getMouvementsStock = () => axios.get(API_URL);
export const getMouvementsRecent = () => axios.get(`${API_URL}/recent`);
export const getMouvementsByMateriel = (id_materiel) => axios.get(`${API_URL}/materiel/${id_materiel}`);
export const getMouvementsByReference = (type_reference, id_reference) => 
  axios.get(`${API_URL}/reference/${type_reference}/${id_reference}`);
export const addMouvementStock = (data) => axios.post(API_URL, data);
export const getMouvementsStats = () => axios.get(`${API_URL}/stats/statistiques`);
import axios from 'axios';

const API_URL = 'http://localhost:3000/attributions';

export const getAttributions = () => axios.get(API_URL);
export const getAttribution = (id) => axios.get(`${API_URL}/${id}`);
export const getAttributionsByDemandeur = (id_demandeur) => axios.get(`${API_URL}/demandeur/${id_demandeur}`);
export const getAttributionsByMateriel = (id_materiel) => axios.get(`${API_URL}/materiel/${id_materiel}`);
export const getAttributionsEnRetard = () => axios.get(`${API_URL}/retard`);
export const getStatistiques = () => axios.get(`${API_URL}/statistiques`);

export const addAttribution = (data) => axios.post(API_URL, data);

export const updateAttribution = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const updateAttributionStatut = (id, statut_attribution) => 
  axios.put(`${API_URL}/${id}/statut`, { statut_attribution });

export const deleteAttribution = (id) => axios.delete(`${API_URL}/${id}`);
import axios from 'axios';

const API_URL = 'http://localhost:3000/depannage';

export const getDepannages = () => axios.get(API_URL);

export const getDepannage = (id) => axios.get(`${API_URL}/${id}`);

export const addDepannage = (data) => axios.post(API_URL, {
  id_materiel: data.id_materiel,
  id_demandeur: data.id_demandeur,
  date_signalement: data.date_signalement,
  description_panne: data.description_panne,
  statut_depannage: data.statut_depannage || 'Signalé',
});

export const updateDepannage = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const updateDepannageStatut = (id, statut_depannage) => 
  axios.patch(`${API_URL}/${id}`, { statut_depannage });

export const deleteDepannage = (id) => axios.delete(`${API_URL}/${id}`);

export const getDepannagesByStatut = (statut) => axios.get(`${API_URL}/statut/${statut}`);

export const getDepannagesByDemandeur = (id_demandeur) => axios.get(`${API_URL}/demandeur/${id_demandeur}`);

export const getDepannagesByMateriel = (id_materiel) => axios.get(`${API_URL}/materiel/${id_materiel}`);

export const getDepannageStats = () => axios.get(`${API_URL}/stats/statistiques`);
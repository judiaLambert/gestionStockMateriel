import axios from 'axios';

const API_URL = 'http://localhost:3000/depannage';

export const getDepannages = () => axios.get(API_URL);

export const getDepannageById = (id) => axios.get(`${API_URL}/${id}`);

export const addDepannage = (data) => axios.post(API_URL, data);

export const updateDepannage = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const updateDepannageStatut = (id, statut) => 
  axios.patch(`${API_URL}/${id}`, { statut_depannage: statut });

export const deleteDepannage = (id) => axios.delete(`${API_URL}/${id}`);

// Signaler une panne depuis l'interface demandeur
export const signalerPanne = async (data) => {
  return axios.post(API_URL, {
    id_materiel: data.id_materiel,
    id_demandeur: data.id_demandeur,
    date_signalement: new Date().toISOString().split('T')[0],
    description_panne: data.description_panne,
    statut_depannage: 'Signalé'
  });
};

// Récupérer les dépannages d'un demandeur
export const getDepannagesByDemandeur = (id_demandeur) => 
  axios.get(`${API_URL}/demandeur/${id_demandeur}`);

// Récupérer les statistiques
export const getDepannageStats = () => 
  axios.get(`${API_URL}/stats/statistiques`);
import axios from 'axios';

const API_URL = 'http://localhost:3000/demande-materiel';

export const getDemandes = () => axios.get(API_URL);
export const getDemande = (id) => axios.get(`${API_URL}/${id}`);
export const getDemandesByDemandeur = (idDemandeur) => 
  axios.get(`${API_URL}/demandeur/${idDemandeur}`);

// CHANGÉ : create → add
export const addDemande = (demandeData) => 
  axios.post(API_URL, demandeData);

export const updateDemande = (id, demandeData) => 
  axios.put(`${API_URL}/${id}`, demandeData);

export const validateDemande = (id, validationData) => 
  axios.put(`${API_URL}/${id}/validation`, validationData);

export const deleteDemande = (id) => 
  axios.delete(`${API_URL}/${id}`);
import axios from 'axios';

const API_URL = 'http://localhost:3000/demandes'; // ← Route backend correcte

// ========== DEMANDES ==========

export const getDemandes = () => axios.get(API_URL);

export const getDemande = (id) => axios.get(`${API_URL}/${id}`);

export const getDemandesByDemandeur = (idDemandeur) => 
  axios.get(`${API_URL}/demandeur/${idDemandeur}`);

export const addDemande = (demandeData) => 
  axios.post(API_URL, demandeData);

export const updateDemande = (id, demandeData) => 
  axios.put(`${API_URL}/${id}`, demandeData);

// Approuver/Refuser une demande
export const updateStatut = (id, statutData) => 
  axios.put(`${API_URL}/${id}/statut`, statutData);

export const deleteDemande = (id) => 
  axios.delete(`${API_URL}/${id}`);



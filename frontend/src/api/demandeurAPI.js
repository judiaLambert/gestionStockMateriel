import axios from 'axios';

const API_URL = 'http://localhost:3000/demandeur';

// Récupérer tous les demandeurs
export const getDemandeurs = () => axios.get(API_URL);

// Récupérer un demandeur par ID
export const getDemandeur = (id) => axios.get(`${API_URL}/${id}`);

// Récupérer un demandeur par ID utilisateur - CORRECTION ICI
export const getDemandeurByUserId = async (userId) => {
  return await axios.get(`${API_URL}/by-user/${userId}`);
};

// Récupérer un demandeur par email
export const getDemandeurByEmail = async (email) => {
  return await axios.get(`${API_URL}/email/${email}`);
};

// Récupérer un demandeur par id_utilisateur (méthode alternative)
export const getDemandeurByUtilisateur = async (id_utilisateur) => {
  return await axios.get(`${API_URL}/utilisateur/${id_utilisateur}`);
};

// Ajouter un nouveau demandeur
export const addDemandeur = (data) => axios.post(API_URL, data);

// Mettre à jour un demandeur
export const updateDemandeur = (id, data) => axios.put(`${API_URL}/${id}`, data);

// Supprimer un demandeur
export const deleteDemandeur = (id) => axios.delete(`${API_URL}/${id}`);

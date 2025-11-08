import axios from 'axios';

const API_URL = 'http://localhost:3000/demande-materiel';

export const getDemandes = () => axios.get(API_URL);
export const getDemande = (id) => axios.get(`${API_URL}/${id}`);
export const addDemande = (data) => axios.post(API_URL, data);
export const updateDemande = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteDemande = (id) => axios.delete(`${API_URL}/${id}`);
export const getDemandesByDemandeur = (idDemandeur) => axios.get(`${API_URL}/demandeur/${idDemandeur}`);
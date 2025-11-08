import axios from 'axios';

const API_URL = 'http://localhost:3000/inventaire';

export const getInventaires = () => axios.get(API_URL);

export const getInventaire = (id) => axios.get(`${API_URL}/${id}`);

export const getInventaireByMateriel = (id_materiel) => axios.get(`${API_URL}/materiel/${id_materiel}`);

export const addInventaire = (data) => axios.post(API_URL, {
  id_materiel: data.id_materiel,
  quantite_stock: data.quantite_stock,
  seuil_alerte: data.seuil_alerte,
  emplacement: data.emplacement,
});

export const updateInventaire = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const updateInventaireReserve = (id_materiel, quantite_reservee) => 
  axios.put(`${API_URL}/materiel/${id_materiel}/reserve`, { quantite_reservee });

export const updateInventaireStock = (id_materiel, quantite_stock) => 
  axios.put(`${API_URL}/materiel/${id_materiel}/stock`, { quantite_stock });

export const deleteInventaire = (id) => axios.delete(`${API_URL}/${id}`);

export const getAlertesStockBas = () => axios.get(`${API_URL}/alertes/stock-bas`);

export const getInventaireStats = () => axios.get(`${API_URL}/stats/statistiques`);
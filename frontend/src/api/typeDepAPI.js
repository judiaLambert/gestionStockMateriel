import axios from 'axios';

const BASE_URL = 'http://localhost:3000/type-departement';

export const getTypesDepartement = () => axios.get(`${BASE_URL}`);
export const addTypeDepartement = (data) => axios.post(`${BASE_URL}`, data);
export const updateTypeDepartement = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteTypeDepartement = (id) => axios.delete(`${BASE_URL}/${id}`);

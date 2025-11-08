import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const authApi = {
  // Connexion
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  firstLoginChangePassword: async (email, newPassword) => {
    const response = await fetch(`${API_URL}/auth/first-login-change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });
    return response.json();
  },

  // Mot de passe oublié
  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  // Réinitialisation mot de passe
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    return response.json();
  },

  // Validation token
  validateToken: async (token) => {
    const response = await fetch(`${API_URL}/auth/validate-token?token=${token}`);
    return response.json();
  }

  
};
// authAPI.js - Ajouter ces fonctions

// Gestion des demandeurs en attente
export const getPendingDemandeurs = async () => {
  const response = await fetch(`${API_URL}/auth/pending-demandeurs`);
  return response.json();
};

export const activateDemandeur = async (idUtilisateur, password) => {
  const response = await fetch(`${API_URL}/auth/activate-demandeur`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUtilisateur, password })
  });
  return response.json();
};

export const rejectDemandeur = async (idUtilisateur) => {
  const response = await fetch(`${API_URL}/auth/reject-demandeur`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUtilisateur })
  });
  return response.json();
};
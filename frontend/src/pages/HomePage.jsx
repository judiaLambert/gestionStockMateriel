import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/login-admin'); // Redirige vers Login.jsx (admin)
  };

  const handleDemandeurLogin = () => {
    navigate('/login-demandeur'); // Redirige vers LoginDemandeur.jsx
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        
        {/* En-tête */}
        <div className="homepage-header">
          <h1 className="homepage-title">
            📊 APPLICATION DE COMPTABILITÉ MATIÈRE
          </h1>
          <h2 className="homepage-subtitle">DE L'ENI</h2>
        </div>

        {/* Description */}
        <div className="homepage-description">
          <p className="description-text">
            Un système complet de gestion et de traçabilité du patrimoine matériel de l'établissement.
            Préservation des deniers publics, sauvegarde du patrimoine et promotion de la bonne gouvernance.
          </p>
        </div>

        {/* Boutons de connexion */}
        <div className="login-buttons-container">
          <button 
            onClick={handleAdminLogin}
            className="login-button admin-button"
          >
            <span className="button-icon">👨‍💼</span>
            <span className="button-text">
              <strong>Se connecter en tant qu'Admin</strong>
              <small>Accès complet au système</small>
            </span>
          </button>

          <button 
            onClick={handleDemandeurLogin}
            className="login-button demandeur-button"
          >
            <span className="button-icon">👤</span>
            <span className="button-text">
              <strong>Se connecter en tant que Demandeur</strong>
              <small>Gestion des demandes de matériel</small>
            </span>
          </button>
        </div>

        {/* Informations supplémentaires */}
        <div className="homepage-footer">
          <p className="footer-text">
            Système sécurisé de gestion du patrimoine matériel
          </p>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
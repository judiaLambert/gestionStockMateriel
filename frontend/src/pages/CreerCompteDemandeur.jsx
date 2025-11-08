import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartements } from '../api/departementAPI';
import '../CreerCompteDemandeur.css';

const CreerCompteDemandeur = () => {
  const navigate = useNavigate();
  const [departements, setDepartements] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    typeDemandeur: 'enseignant',
    id_departement: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la liste des départements
  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const response = await getDepartements();
        setDepartements(response.data);
      } catch (err) {
        console.error('Erreur chargement départements:', err);
      }
    };
    fetchDepartements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.nom || !formData.email || !formData.telephone) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (formData.typeDemandeur === 'service' && !formData.id_departement) {
      setError('Veuillez sélectionner un département');
      setLoading(false);
      return;
    }

    try {
      // Envoyer la demande d'inscription
      const response = await fetch('http://localhost:3000/auth/register-demandeur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          typeDemandeur: formData.typeDemandeur,
          id_departement: formData.typeDemandeur === 'enseignant' ? null : formData.id_departement
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Votre demande a été envoyée ! L\'admin vous enverra vos identifiants par email.');
        navigate('/login-demandeur');
      } else {
        setError(result.message || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Réinitialiser l'erreur quand l'utilisateur modifie
    if (error) setError('');
  };

  return (
    <div className="creer-compte-container">
      <div className="creer-compte-form">
        {/* En-tête fixe */}
        <div className="form-header">
          <h2>📝 Créer un compte Demandeur</h2>
          <p className="form-description">
            Remplissez ce formulaire pour demander un compte. L'admin vous enverra vos identifiants par email.
          </p>
        </div>

        {/* Formulaire avec scroll */}
        <div className="form-scroll-container">
          <form onSubmit={handleSubmit}>
            {/* Type de demandeur */}
            <div className="form-group">
              <label className="form-label">Vous êtes *</label>
              <div className="radio-group">
                <label className={`radio-label ${formData.typeDemandeur === 'enseignant' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="typeDemandeur"
                    value="enseignant"
                    checked={formData.typeDemandeur === 'enseignant'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-content">
                    <span className="radio-icon">👨‍🏫</span>
                    <span className="radio-text">
                      <strong>Enseignant</strong>
                      <small>Personnel enseignant</small>
                    </span>
                  </span>
                </label>
                
                <label className={`radio-label ${formData.typeDemandeur === 'service' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="typeDemandeur"
                    value="service"
                    checked={formData.typeDemandeur === 'service'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-content">
                    <span className="radio-icon">🏢</span>
                    <span className="radio-text">
                      <strong>Membre de service</strong>
                      <small>Personnel administratif</small>
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Nom complet */}
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre nom complet"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Adresse email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre@email.mg"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="form-group">
              <label className="form-label">Numéro de téléphone *</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="form-input"
                placeholder="032 12 345 67"
                required
              />
            </div>

            {/* Liste déroulante département (seulement si "service" sélectionné) */}
            {formData.typeDemandeur === 'service' && (
              <div className="form-group">
                <label className="form-label">Département *</label>
                <select
                  name="id_departement"
                  value={formData.id_departement}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Sélectionnez votre département</option>
                  {departements.map(dep => (
                    <option key={dep.id_departement} value={dep.id_departement}>
                      {dep.nom_service}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              disabled={loading} 
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  📨 Envoyer la demande
                </>
              )}
            </button>
          </form>
        </div>

        {/* Liens en bas (toujours visibles) */}
        <div className="form-footer">
          <div className="form-links">
            <p>
              Déjà un compte ?{' '}
              <a href="/login-demandeur" className="link">
                Se connecter
              </a>
            </p>
            <a href="/" className="back-link">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreerCompteDemandeur;
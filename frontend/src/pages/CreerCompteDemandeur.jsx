import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, User, Building2, UserPlus, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getDepartements } from '../api/departementAPI';
import { showSuccess, showError } from '../alerts.jsx';

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
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        setLoadingDepts(true);
        const response = await getDepartements();
        setDepartements(response.data);
      } catch (err) {
        console.error('Erreur:', err);
        showError('Impossible de charger les départements');
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.nom || !formData.email || !formData.telephone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.typeDemandeur === 'service' && !formData.id_departement) {
      setError('Veuillez sélectionner un département');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Validation téléphone (format Madagascar)
    const phoneRegex = /^(032|033|034|038|037)\s?\d{2}\s?\d{3}\s?\d{2}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      setError('Format téléphone invalide. Ex: 032 12 345 67');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/register-demandeur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        showSuccess('Demande envoyée ! Vous recevrez vos identifiants par email.');
        setTimeout(() => navigate('/login-demandeur'), 2000);
      } else {
        setError(result.message || 'Erreur lors de l\'envoi de la demande');
        showError(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      const errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur lors de la modification
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Header Bleu */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Créer un Compte Demandeur</h1>
          <p className="text-blue-100 text-sm">
            Remplissez le formulaire ci-dessous pour soumettre votre demande
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Message d'erreur global */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-800">Erreur</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Type de demandeur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type de compte *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.typeDemandeur === 'enseignant'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="typeDemandeur"
                  value="enseignant"
                  checked={formData.typeDemandeur === 'enseignant'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                    formData.typeDemandeur === 'enseignant' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    👨‍🏫
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Enseignant</p>
                    <p className="text-xs text-gray-600">Personnel enseignant</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.typeDemandeur === 'service'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="typeDemandeur"
                  value="service"
                  checked={formData.typeDemandeur === 'service'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                    formData.typeDemandeur === 'service' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    🏢
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Service</p>
                    <p className="text-xs text-gray-600">Personnel administratif</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom complet *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ex: Jean Rakoto"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="votre@email.mg"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro de téléphone *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="032 12 345 67"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: 032/033/034/038 XX XXX XX</p>
          </div>

          {/* Département (si service) */}
          {formData.typeDemandeur === 'service' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Département *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Building2 size={20} />
                </div>
                {loadingDepts ? (
                  <div className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Chargement des départements...</span>
                  </div>
                ) : (
                  <select
                    name="id_departement"
                    value={formData.id_departement}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionnez un département</option>
                    {departements.map(dep => (
                      <option key={dep.id_departement} value={dep.id_departement}>
                        {dep.nom_service}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-xl">ℹ️</span>
              <span>
                Votre demande sera examinée par l'administrateur. 
                Vous recevrez vos identifiants de connexion par email une fois approuvée.
              </span>
            </p>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading || loadingDepts}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Envoyer la demande
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <a href="/login-demandeur" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Se connecter
              </a>
            </p>
            <button
              onClick={() => navigate('/login-demandeur')}
              type="button"
              disabled={loading}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreerCompteDemandeur;

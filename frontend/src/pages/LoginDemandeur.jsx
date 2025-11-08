import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { getDepartements } from '../api/departementAPI';

const LoginDemandeur = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    type: 'enseignant',
    id_departement: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [departements, setDepartements] = useState([]);
  const [errors, setErrors] = useState({});

  // Charger les départements
  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const res = await getDepartements();
        setDepartements(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des départements:', err);
      }
    };
    fetchDepartements();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    const newErrors = {};
    
    if (!formData.nom) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (formData.type === 'service' && !formData.id_departement) {
      newErrors.id_departement = 'Veuillez sélectionner un département';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Login data:', formData);
    // Ici vous ajouterez votre logique de connexion
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header plus compact */}
        <div className="bg-blue-600 text-white p-4 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <LogIn size={24} />
          </div>
          <h1 className="text-xl font-bold">Connexion Demandeur</h1>
          <p className="text-blue-100 text-sm mt-1">Accédez à votre espace</p>
        </div>

        {/* Formulaire avec hauteur réduite */}
        <div className="max-h-[450px] overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type d'utilisateur - Boutons Radio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vous êtes *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="enseignant"
                    checked={formData.type === 'enseignant'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-full p-2 border-2 rounded-lg text-center transition-all text-sm ${
                    formData.type === 'enseignant'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}>
                    <span className="font-medium">Enseignant</span>
                  </div>
                </label>

                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="service"
                    checked={formData.type === 'service'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-full p-2 border-2 rounded-lg text-center transition-all text-sm ${
                    formData.type === 'service'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}>
                    <span className="font-medium">Service</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Champ Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Votre nom complet"
                required
              />
              {errors.nom && (
                <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
              )}
            </div>

            {/* Liste des départements (uniquement si "service" est sélectionné) */}
            {formData.type === 'service' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département *
                </label>
                <select
                  name="id_departement"
                  value={formData.id_departement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  required
                >
                  <option value="">Sélectionnez un département</option>
                  {departements.map((dept) => (
                    <option key={dept.id_departement} value={dept.id_departement}>
                      {dept.nom_service}
                    </option>
                  ))}
                </select>
                {errors.id_departement && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_departement}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center w-6 h-6 mt-2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm mt-4"
            >
              <LogIn size={16} />
              Se Connecter
            </button>
          </form>

          {/* Liens en bas - TOUJOURS VISIBLES */}
          <div className="mt-4 text-center space-y-2 border-t pt-4">
            <a href="#" className="block text-blue-600 hover:text-blue-800 text-xs transition-colors">
              Mot de passe oublié ?
            </a>
             <div className="login-links">
            <p>Pas encore de compte ? <a href="/creer-compte-demandeur">Créer un compte</a></p>
            <a href="/">← Retour à l'accueil</a>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LoginDemandeur;
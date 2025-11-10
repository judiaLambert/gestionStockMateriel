import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authApi } from '../api/authAPI';

const LoginDemandeur = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Tentative de connexion demandeur...');
      const result = await authApi.login(formData.email, formData.password);
      console.log('🔍 Résultat login:', result);

      if (result.success) {
        console.log('✅ Connexion demandeur réussie!');
        localStorage.setItem('user', JSON.stringify(result.utilisateur));
        
        // REDIRECTION AUTOMATIQUE VERS FIRST-LOGIN SI PREMIER LOGIN
        if (result.utilisateur.premier_login) {
          console.log('➡️ Premier login - Redirection vers first-login');
          navigate('/first-login');
        } else {
          console.log('➡️ Redirection vers dashboard demandeur');
          navigate('/dashboard-demandeur');
        }
      } else {
        console.log('❌ Échec connexion demandeur');
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('💥 Erreur connexion demandeur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold">Connexion Demandeur</h1>
          <p className="text-blue-100 mt-2">Accédez à votre espace</p>
        </div>

        {/* Formulaire de CONNEXION - seulement email et mot de passe */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          {/* Liens en bas */}
          <div className="mt-6 text-center space-y-3">
            <a href="/forgot-password" className="block text-blue-600 hover:text-blue-800 text-sm transition-colors">
              Mot de passe oublié ?
            </a>
            <div className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <a href="/creer-compte-demandeur" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Créer un compte
              </a>
            </div>
            <a href="/" className="block text-gray-500 hover:text-gray-700 text-sm transition-colors">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDemandeur;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authAPI';
import './Login.css';

const LoginAdmin = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Tentative de connexion...');
      const result = await authApi.login(formData.email, formData.password);
      console.log('🔍 Résultat login:', result);

      if (result.success) {
        console.log('✅ Connexion réussie!');
        localStorage.setItem('user', JSON.stringify(result.utilisateur));
        setUser(result.utilisateur); // Mettre à jour l'état global
        
        if (result.utilisateur.premier_login) {
          console.log('➡️ Redirection vers first-login');
          navigate('/first-login');
        } else {
          console.log('➡️ Redirection vers dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('❌ Échec connexion');
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('💥 Erreur connexion:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@organisation.mg"
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Admin12345!"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="login-links">
            <a href="/forgot-password">Mot de passe oublié ?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authAPI';

const FirstLogin = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || !JSON.parse(userData).premier_login) {
      navigate('/login-demandeur');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.firstLoginChangePassword(user.email, newPassword);

      if (result.success) {
        const updatedUser = { ...user, premier_login: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // REDIRECTION VERS LE DASHBOARD APPROPRIÉ
        if (user.role === 'demandeur') {
          navigate('/dashboard-demandeur');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="first-login-container">
      <div className="first-login-form">
        <h2>Changement de mot de passe obligatoire</h2>
        <p>Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              placeholder="Entrez votre nouveau mot de passe"
            />
          </div>
          
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirmez votre nouveau mot de passe"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Changement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstLogin;
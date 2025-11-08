import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authAPI';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Lien invalide');
        return;
      }

      try {
        const result = await authApi.validateToken(token);

        if (result.valid) {
          setValidToken(true);
          setEmail(result.email);
        } else {
          setError('Lien invalide ou expiré');
        }
      } catch (err) {
        setError('Erreur de validation du lien');
      }
    };

    validateToken();
  }, [token]);

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
      const result = await authApi.resetPassword(token, newPassword);

      if (result.success) {
        alert('Mot de passe réinitialisé avec succès');
        navigate('/login');
      } else {
        setError('Erreur lors de la réinitialisation');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !error) {
    return <div>Validation du lien en cours...</div>;
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Réinitialisation du mot de passe</h2>
        {email && <p>Pour le compte: {email}</p>}
        
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
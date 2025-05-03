import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const ChangePassword = ({ match }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  
  const { email } = match.params;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/users/change-password', {
        email: email,
        newPassword: newPassword,
      });
      
      history.push('http://localhost:3000/login');
    } catch (error) {
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Changer votre mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Changer le mot de passe'}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ChangePassword;

import React, { useState } from 'react';
import axios from 'axios';

const SendInvitationForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/mailer/send-invitation', {
        email: userEmail,
        adminPassword: adminPassword,
        userEmail: userEmail,
        username: username,
      });

      setMessage('Invitation envoyée avec succès');
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Envoyer une invitation</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email de l\'utilisateur invité</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nom d\'utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe de votre email (administrateur)</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default SendInvitationForm;

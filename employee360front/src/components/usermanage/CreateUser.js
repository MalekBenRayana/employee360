import React, { useState } from 'react';
import { createUser } from '../../services/userService';

const CreateUser = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, username, password, roleName };

    try {
      const newUser = await createUser(userData);
      console.log('Utilisateur créé:', newUser);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur', error);
    }
  };

  return (
    <div>
      <h2>Créer un utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Rôle:</label>
          <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default CreateUser;

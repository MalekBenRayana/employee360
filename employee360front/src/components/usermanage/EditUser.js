import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getUserById, updateUser } from '../../services/userService';

const EditUser = () => {
  const { userId } = useParams();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [roleName, setRoleName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById(userId);
        setEmail(user.email);
        setUsername(user.username);
        setRoleName(user.role);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur', error);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = { email, username, password, roleName };

    try {
      await updateUser(userId, updatedUser);
      console.log('Utilisateur mis à jour avec succès');
      history.push('/usermanage');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
    }
  };

  return (
    <div>
      <h2>Modifier l'utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Rôle:</label>
          <input 
            type="text" 
            value={roleName} 
            onChange={(e) => setRoleName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Mot de passe (laisser vide pour ne pas modifier):</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
};

export default EditUser;

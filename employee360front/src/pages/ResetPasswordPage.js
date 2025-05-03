import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const userEmail = queryParams.get('email');

  useEffect(() => {
    
  }, [userId, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!oldPassword || !newPassword) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/users/reset-password/${userId}`,
        {
          currentPassword: oldPassword,
          newPassword: newPassword,
        }
      );
      

      if (response.status === 200) {
        setIsPasswordReset(true);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    }
  };

  useEffect(() => {
    if (isPasswordReset) {
      navigate('/login');
    }
  }, [isPasswordReset, navigate]);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4" style={{ width: '400px' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">
            <FaLock className="mb-2" /> Changer le mot de passe
          </h2>

          {errorMessage && (
            <div className="alert alert-danger">
              <FaExclamationTriangle className="mr-2" /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label">Ancien mot de passe</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Modifier le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

import React, { useState, useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';

const NotificationModal = ({ show, onClose }) => {
  const { sendGlobalNotification } = useContext(NotificationContext);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendGlobalNotification(message.trim());
      setMessage('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: 'white',
          color: '#000',
          padding: '20px', 
          borderRadius: '10px', 
          width: '400px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h4>Nouvelle Notification</h4>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Entrez votre message"
            style={{
              width: '100%',
              height: '100px',
              marginTop: '10px',
              resize: 'none',
              border: '1px solid #ddd',
              padding: '10px',
              color: '#000',
              backgroundColor: '#f9f9f9'
            }}
          />
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ marginRight: '10px', backgroundColor: '#ccc' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#3498db', color: '#fff' }}
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;

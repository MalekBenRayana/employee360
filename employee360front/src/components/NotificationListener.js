import React, { useState, useContext, useEffect } from 'react'; // Ajout de useEffect
import { FaBell, FaTimes } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import { NotificationContext } from '../contexts/NotificationContext';
import '../assets/styles/NotificationListener.css';
import '../assets/styles/SlideInNotifications.css';

moment.locale('fr');

const NotificationListener = () => {
  const { notifications } = useContext(NotificationContext);
  const [panelOpen, setPanelOpen] = useState(false);

  const togglePanel = () => setPanelOpen(!panelOpen);

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Ajout de useEffect pour observer les changements dans les notifications
  useEffect(() => {
    console.log('➡️ Notifications dans NotificationListener:', notifications);
  }, [notifications]);

  return (
    <div className="sidebar-notification-wrapper">
      <div
        onClick={togglePanel}
        className="sidebar-notification-button"
      >
        <FaBell size={18} />
        <span>Notifications</span>
        {notifications.length > 0 && (
          <span className="sidebar-notification-count">
            {notifications.length}
          </span>
        )}
      </div>

      <div className={`slide-in-notifications ${panelOpen ? 'open' : ''}`}>
        <div className="notifications-header">
          <h3>Notifications</h3>
          <FaTimes className="close-button" onClick={togglePanel} />
        </div>
        <ul className="notification-list">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notif) => (
              <li key={notif.id} className="notification-item">
                <div>
                  <strong>Message:</strong> {typeof notif.message === 'string' ? notif.message : JSON.stringify(notif.message)}
                </div>
                <div>
                  <strong>Créé le:</strong> {moment(notif.createdAt).format('LLL')}
                </div>
                <hr />
              </li>
            ))
          ) : (
            <div className="no-notification">Aucune nouvelle notification.</div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationListener;
import React, { useState, useContext, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationListener from '../components/NotificationListener';
import '../assets/styles/AppHeader.css';
import { NotificationContext } from '../contexts/NotificationContext';

const AppHeader = () => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { notifications, isLoading } = useContext(NotificationContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  useEffect(() => {
    if (!isLoading) {
      const count = notifications.filter(notif => !notif.isRead).length;
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [notifications, isLoading]);

  return (
    <header className="app-header">
      <div className="app-title"></div>
      <div className="header-actions">
        <button className="notification-icon-button" onClick={toggleNotificationPanel}>
          <FaBell size={20} />
          {!isLoading && unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}
        </button>
        {isNotificationPanelOpen && (
          <NotificationListener
            panelOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
          />
        )}
      </div>
    </header>
  );
};

export default AppHeader;
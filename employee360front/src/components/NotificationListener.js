import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaBell, FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaEnvelopeOpen } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import { NotificationContext } from '../contexts/NotificationContext';
import '../assets/styles/SlideInNotifications.css';
import notificationService from '../services/notificationService';
import { getUserIdFromToken } from '../utils/tokenUtils';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

moment.locale('fr');

const ITEMS_PER_PAGE = 10;

const NotificationListener = ({ panelOpen, onClose }) => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const userId = getUserIdFromToken();
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allNotificationsLoaded, setAllNotificationsLoaded] = useState(false);

  const togglePanel = useCallback(() => {
    onClose(false);
    setPage(1);
    setAllNotificationsLoaded(false);
  }, [onClose]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    return sortedNotifications.slice(0, page * ITEMS_PER_PAGE);
  }, [sortedNotifications, page]);

  const hasMore = useMemo(() => displayedNotifications.length < sortedNotifications.length, [displayedNotifications.length, sortedNotifications.length]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
        setLoadingMore(false);
      }, 500);
    }
  }, [hasMore, loadingMore]);

  const loadMoreRef = useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasMore && !loadingMore) {
        loadMore();
      }
    },
    enabled: panelOpen && hasMore,
  });

  const updateNotificationReadStatus = useCallback(async (id, isRead) => {
    try {
      const serviceFunction = isRead ? notificationService.markNotificationAsRead : notificationService.markNotificationAsUnread;
      await serviceFunction(id);
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, isRead } : notif
        )
      );
    } catch (error) {
      console.error(`Erreur lors du marquage comme ${isRead ? 'lu' : 'non lu'}:`, error);
    }
  }, [notificationService, setNotifications]);

  const handleNotificationClick = useCallback((notif) => {
    if (!notif.isRead) {
      updateNotificationReadStatus(notif.id, true);
      if (typeof notif.message === 'string' && notif.message.includes('http://localhost:3001/respond/')) {
        const link = 'http://localhost:3001/respond/' + notif.message.split('http://localhost:3001/respond/')[1];
        window.open(link, '_blank');
      }
    } else if (typeof notif.message === 'string' && notif.message.includes('http://localhost:3001/respond/')) {
      const link = 'http://localhost:3001/respond/' + notif.message.split('http://localhost:3001/respond/')[1];
      window.open(link, '_blank');
    }
  }, [updateNotificationReadStatus]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (userId) {
        try {
          const userNotifications = await notificationService.getUserNotifications(userId);
          setNotifications(userNotifications);
        } catch (error) {
          console.error("Erreur lors de la récupération des notifications:", error);
        }
      }
    };

    fetchUserNotifications();
  }, [userId, setNotifications, notificationService]);

  useEffect(() => {
    setUnreadCount(notifications.filter(notif => !notif.isRead).length);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose(false);
      }
    };

    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelRef, onClose, panelOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle size={16} className="notification-icon info" />;
      case 'success':
        return <FaCheckCircle size={16} className="notification-icon success" />;
      case 'warning':
        return <FaExclamationTriangle size={16} className="notification-icon warning" />;
      default:
        return <FaEnvelopeOpen size={16} className="notification-icon default" />;
    }
  };

  return (
    <div className={`slide-in-notifications-wrapper ${panelOpen ? 'open' : ''}`} ref={panelRef}>
      <div className="notifications-header">
        <h3>Notifications</h3>
        <button className="close-button" onClick={togglePanel}>
          <FaTimes size={18} />
        </button>
      </div>
      <ul className="notification-list" ref={listRef}>
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notif) => {
            const hasLink = typeof notif.message === 'string' && notif.message.includes('http://localhost:3001/respond/');
            const messageText = hasLink ? notif.message.split('http://localhost:3001/respond/')[0] : notif.message;
            const link = hasLink ? 'http://localhost:3001/respond/' + notif.message.split('http://localhost:3001/respond/')[1] : '';

            return (
              <li
                key={notif.id}
                className={`notification-item ${notif.isRead ? 'read-item' : 'unread-item'} notification-type-${notif.type || 'default'}`}
                onClick={() => handleNotificationClick(notif)} // Gérer le clic sur la notification
                style={{ cursor: hasLink ? 'pointer' : 'default' }}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">
                    {messageText}
                    {hasLink && (
                      <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                        {link.length > 50 ? link.substring(0, 50) + '...' : link}
                      </a>
                    )}
                  </p>
                  <p className="notification-meta">
                    <small className="notification-date">{moment(notif.createdAt).fromNow()}</small>
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <div className="no-notification">Aucune nouvelle notification.</div>
        )}
        {hasMore && (
          <li ref={loadMoreRef} className="load-more-indicator">
            {loadingMore ? 'Chargement...' : 'Charger plus'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default NotificationListener;
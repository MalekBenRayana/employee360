import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserIdFromToken } from '../utils/tokenUtils';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const parsedNotifications = stored.map(notif => ({
      ...notif,
      createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date(),
      isRead: notif.isRead || false,
      type: notif.type || 'default', 
      id: notif.id || Math.random().toString(36).substring(7),
    }));
    setNotifications(parsedNotifications);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const socket = io('http://localhost:3001', {
      query: { userId: userId },
      path: '/'
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connecté au WebSocket avec userId:', userId, socket.id, socket.handshake.query.userId);
    });

    const handleNotification = (data) => {
      const { message, recipient, createdAt, type = 'default', id = Math.random().toString(36).substring(7) } = data;
      setNotifications((prev) => {
        const newNotification = {
          id,
          message,
          recipient,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          isRead: false,
          type,
        };
        const updated = [...prev, newNotification];
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
    };

    socket.on('newNotification', handleNotification);
    socket.on('newGlobalNotification', handleNotification);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendGlobalNotification = async (message) => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Utilisateur non authentifié");
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message })
      });

      const savedNotification = await res.json();
      console.log('📨 Notification sauvegardée', savedNotification);

      if (socketRef.current) {
        socketRef.current.emit('sendGlobalNotification', message);
      }
    } catch (error) {
      console.error("❌ Erreur d’envoi :", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, sendGlobalNotification, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};
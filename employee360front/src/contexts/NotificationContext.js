import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserIdFromToken } from '../utils/tokenUtils';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        // Convertir les chaînes de date stockées en objets Date lors de la récupération
        const parsedNotifications = stored.map(notif => ({
            ...notif,
            createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date()
        }));
        setNotifications(parsedNotifications);
    }, []);

    useEffect(() => {
        const userId = getUserIdFromToken();
        if (!userId) return;

        const socket = io('http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connecté au WebSocket');
            socket.emit('joinUserRoom', userId);
        });

        const handleNotification = (data) => {
            const { message, recipient, createdAt } = data;
            setNotifications((prev) => {
                // Créez un nouvel objet de notification avec une nouvelle instance de Date
                const newNotification = {
                    message,
                    recipient,
                    createdAt: createdAt ? new Date(createdAt) : new Date()
                };
                const updated = [...prev, newNotification];
                localStorage.setItem('notifications', JSON.stringify(updated));
                return updated;
            });
        };

        socket.on('newNotification', handleNotification);
        socket.on('newGlobalNotification', handleNotification);

        return () => {
            socket.disconnect();
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

            socketRef.current.emit('sendGlobalNotification', message);
        } catch (error) {
            console.error("❌ Erreur d’envoi :", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, sendGlobalNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
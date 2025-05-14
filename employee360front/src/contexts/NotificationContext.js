import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserIdFromToken } from '../utils/tokenUtils';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        const parsedNotifications = stored.map(notif => ({
            ...notif,
            createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date()
        }));
        setNotifications(parsedNotifications);
    }, []);

    useEffect(() => {
        const userId = getUserIdFromToken();
        if (!userId) return;

        // **CORRECTION 1 : URL du serveur WebSocket**
        const socket = io('http://localhost:3001', {
            // **CORRECTION 2 : Envoyer l'userId dans la query de connexion**
            query: { userId: userId },
            path: '/' // Assure-toi que le path correspond à ta configuration NestJS
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connecté au WebSocket avec userId:', userId, socket.id, socket.handshake.query.userId);
            // **SUPPRESSION : Plus besoin d'émettre 'joinUserRoom' ici**
        });

        const handleNotification = (data) => {
            const { message, recipient, createdAt } = data;
            setNotifications((prev) => {
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
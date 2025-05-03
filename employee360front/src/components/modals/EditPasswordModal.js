import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from '../../axios';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const EditPasswordModal = ({ show, onHide, profile, token }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        try {
            const response = await axios.patch(
                `/users/${profile.id}/change-password`,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage('Mot de passe mis à jour avec succès.');
            setError('');
            setCurrentPassword('');
            setNewPassword('');

            setTimeout(() => {
                onHide();
                setMessage('');
            }, 1500);
        } catch (error) {
            setMessage('');
            setError('Erreur lors de la mise à jour du mot de passe.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered className="edit-password-modal-pro">
            <Modal.Header closeButton className="bg-light border-bottom-0">
                <Modal.Title className="fw-bold text-secondary">Changer le mot de passe</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {error && <div className="alert alert-danger border-0 rounded-sm d-flex align-items-center"><FaExclamationTriangle className="me-2" /> {error}</div>}
                {message && <div className="alert alert-success border-0 rounded-sm d-flex align-items-center"><FaCheckCircle className="me-2" /> {message}</div>}
                <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label text-muted small">Mot de passe actuel</label> {/* Label plus discret */}
                        <input
                            type="password"
                            className="form-control form-control-lg rounded-sm border-secondary"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="form-label text-muted small">Nouveau mot de passe</label>
                        <input
                            type="password"
                            className="form-control form-control-lg rounded-sm border-secondary"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={onHide} className="rounded-pill px-3 me-2 shadow-sm">
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" className="rounded-pill px-4 shadow">
                            Changer le mot de passe
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default EditPasswordModal;
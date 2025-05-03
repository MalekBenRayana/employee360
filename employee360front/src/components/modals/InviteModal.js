import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/styles/InviteModal.css'

const InviteModal = ({ showModal, setShowModal, fetchUsers }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [roleId, setRoleId] = useState('');
    const [roles, setRoles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://localhost:3000/roles');
                setRoles(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des rôles:", error);
                setErrorMessage("Erreur lors du chargement des rôles.");
            }
        };

        fetchRoles();
    }, []);

    const handleAddUser = async () => {
        if (!email || !username || !roleId) {
            setErrorMessage("Veuillez entrer tous les champs.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3000/users/create-temporary', {
                email: email,
                username: username,
                roleId: roleId,
            });

            if (response.data) {
                setShowModal(false);
                setEmail('');
                setUsername('');
                setRoleId('');
                fetchUsers();
            }
        } catch (error) {
            setErrorMessage("Erreur lors de l'ajout de l'utilisateur.");
            console.error("Erreur lors de l'ajout de l'utilisateur:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">Inviter un nouvel utilisateur</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                {errorMessage && <Alert variant="danger" className="alert-enhanced">{errorMessage}</Alert>}
                <Form>
                    <Form.Group controlId="formEmail" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Entrez l'adresse email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!errorMessage && !email}
                            className="form-control-enhanced"
                        />
                        <Form.Control.Feedback type="invalid" className="feedback-enhanced">Veuillez entrer un email valide.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formUsername" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Nom d'utilisateur</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Entrez le nom d'utilisateur"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            isInvalid={!!errorMessage && !username}
                            className="form-control-enhanced"
                        />
                        <Form.Control.Feedback type="invalid" className="feedback-enhanced">Veuillez entrer un nom d'utilisateur.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formRole" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Rôle</Form.Label>
                        <Form.Control
                            as="select"
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            isInvalid={!!errorMessage && !roleId}
                            className="form-control-enhanced form-select-enhanced"
                        >
                            <option value="">Sélectionnez un rôle</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.id} - {role.name}
                                </option>
                            ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid" className="feedback-enhanced">Veuillez sélectionner un rôle.</Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="button-secondary-enhanced">
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAddUser}
                    disabled={!email || !username || !roleId || isSubmitting}
                    className={`button-primary-enhanced ${isSubmitting ? 'button-disabled-enhanced' : ''}`}
                >
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InviteModal;
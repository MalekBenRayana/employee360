import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/styles/EditModal.css'

const EditModal = ({ showModal, setShowModal, user, handleSaveUser }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://localhost:3000/roles');
                setRoles(response.data);
                setLoadingRoles(false);
            } catch (err) {
                setError('Erreur lors de la récupération des rôles.');
                setLoadingRoles(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setSelectedRoles(user.roles.map((role) => role.name));
        }
    }, [user]);

    const handleRoleChange = (e) => {
        const value = e.target.value;
        setSelectedRoles((prevRoles) =>
            prevRoles.includes(value)
                ? prevRoles.filter((role) => role !== value)
                : [...prevRoles, value]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedUser = {
            ...user,
            username,
            email,
            roles: selectedRoles.map((roleName) => ({ name: roleName })),
        };
        handleSaveUser(updatedUser);
    };

    if (loadingRoles) {
        return <div className="loading-indicator-enhanced">Chargement des rôles...</div>;
    }

    if (error) {
        return <div className="error-message-enhanced">{error}</div>;
    }

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="edit-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">Modifier l'utilisateur</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formUsername" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Nom d'utilisateur</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="form-control-enhanced"
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control-enhanced"
                        />
                    </Form.Group>
                    <Form.Group controlId="formRole" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Rôle(s)</Form.Label>
                        <Form.Control
                            as="select"
                            multiple
                            value={selectedRoles}
                            onChange={handleRoleChange}
                            required
                            className="form-control-enhanced form-select-enhanced"
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="button-primary-enhanced">
                        Sauvegarder
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="button-secondary-enhanced">
                    Annuler
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditModal;
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap'; // Import de InputGroup
import axios from 'axios';
import { FaUserPlus, FaEnvelope, FaUser, FaUserTag, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'; // Import des icônes
import '../../assets/styles/InviteModal.css';

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
            setErrorMessage("Veuillez remplir tous les champs.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3000/users/create-temporary', {
                email: email,
                username: username,
                roleId: parseInt(roleId, 10), // Assurez-vous que roleId est un entier
            });

            if (response.status === 201) { // Vérifiez le statut de succès attendu
                setShowModal(false);
                setEmail('');
                setUsername('');
                setRoleId('');
                fetchUsers(); // Actualise la liste des utilisateurs
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="invite-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">
                    <FaUserPlus className="modal-title-icon" /> Inviter un Nouvel Utilisateur
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                {errorMessage && <Alert variant="danger" className="alert-enhanced">{errorMessage}</Alert>}
                <Form>
                    <Form.Group controlId="formEmail" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Email</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="input-icon-left"><FaEnvelope /></InputGroup.Text>
                            <Form.Control
                                type="email"
                                placeholder="Entrez l'adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control-styled"
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="formUsername" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Nom d'utilisateur</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="input-icon-left"><FaUser /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="form-control-styled"
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="formRole" className="form-group-enhanced">
                        <Form.Label className="form-label-enhanced">Rôle</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="input-icon-left"><FaUserTag /></InputGroup.Text>
                            <Form.Control
                                as="select"
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                required
                                className="form-control-styled"
                            >
                                <option value="">Sélectionnez un rôle</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="button-cancel">
                    <FaTimesCircle className="button-icon" /> Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAddUser}
                    disabled={!email || !username || !roleId || isSubmitting}
                    className={`button-primary ${isSubmitting ? 'button-disabled' : ''}`}
                >
                    {isSubmitting ? 'Ajout en cours...' : (<><FaCheckCircle className="button-icon" /> Ajouter</>)}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InviteModal;
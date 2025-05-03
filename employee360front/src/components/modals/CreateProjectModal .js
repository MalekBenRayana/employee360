import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import '../../assets/styles/CreateProjectModal.css'

const CreateProjectModal = ({ show, handleClose, handleCreateProject }) => {
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [project_name, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [userRoles, setUserRoles] = useState({});

    const statuses = ['En cours', 'Terminé', 'En attente'];
    const priorities = ['HAUTE', 'MÉDIUM', 'BASSE'];

    useEffect(() => {
        axios.get('http://localhost:3000/users')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error("Erreur lors de la récupération des utilisateurs:", error));

        axios.get('http://localhost:3000/departments')
            .then((response) => setDepartments(response.data))
            .catch((error) => console.error("Erreur lors de la récupération des départements:", error));

        axios.get('http://localhost:3000/project-roles')
            .then((response) => setRoles(response.data))
            .catch((error) => console.error("Erreur lors de la récupération des rôles:", error));
    }, []);

    const handleRoleChange = (userId, roleId) => {
        setUserRoles((prevRoles) => ({
            ...prevRoles,
            [userId]: roleId,
        }));
    };

    const handleSubmit = () => {
        const newProject = {
            project_name,
            description,
            start_date: new Date(start_date).toISOString().split('T')[0],
            end_date: new Date(end_date).toISOString().split('T')[0],
            status,
            priority,
            manager_id: parseInt(selectedManager, 10),
            department_id: parseInt(selectedDepartment, 10),
            users: selectedUsers.map((userId) => ({
                user_id: parseInt(userId, 10),
                role_id: parseInt(userRoles[userId], 10)
            })),
        };

        console.log('Données envoyées au serveur:', newProject);

        axios.post('http://localhost:3000/projects', newProject)
            .then(() => {
                handleCreateProject();
                handleClose();
            })
            .catch((error) => console.error('Erreur lors de la création du projet:', error));
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="create-project-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">Ajouter un Projet</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formProjectName" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Nom du Projet</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nom du Projet"
                                    value={project_name}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formManager" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Chef de Projet</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedManager}
                                    onChange={(e) => setSelectedManager(e.target.value)}
                                    className="form-control-enhanced form-select-enhanced"
                                >
                                    <option value="">Choisir un chef de projet</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.username}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group controlId="formDescription" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="form-control-enhanced form-textarea-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formStartDate" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Date de Début</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={start_date}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formEndDate" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Date de Fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={end_date}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formStatus" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Statut</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="form-control-enhanced form-select-enhanced"
                                >
                                    <option value="">Choisir un statut</option>
                                    {statuses.map((statusOption) => (
                                        <option key={statusOption} value={statusOption}>{statusOption}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formPriority" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Priorité</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="form-control-enhanced form-select-enhanced"
                                >
                                    <option value="">Choisir une priorité</option>
                                    {priorities.map((priorityOption) => (
                                        <option key={priorityOption} value={priorityOption}>{priorityOption}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formDepartment" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Département</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="form-control-enhanced form-select-enhanced"
                                >
                                    <option value="">Choisir un département</option>
                                    {departments.map((department) => (
                                        <option key={department.department_id} value={department.department_id}>
                                            {department.department_name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formUsers" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Membres de l'équipe</Form.Label>
                                <Select
                                    isMulti
                                    options={users.map((user) => ({
                                        value: user.id,
                                        label: user.username,
                                    }))}
                                    value={users.filter((user) => selectedUsers.includes(user.id)).map((user) => ({
                                        value: user.id,
                                        label: user.username,
                                    }))}
                                    onChange={(selectedOptions) => setSelectedUsers(selectedOptions.map((option) => option.value))}
                                    className="react-select-container-enhanced"
                                    classNamePrefix="react-select-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Label className="form-label-enhanced">Rôles</Form.Label>
                            {selectedUsers.map((userId) => (
                                <Form.Group key={userId} controlId={`role-${userId}`} className="form-group-enhanced">
                                    <Form.Label className="form-label-enhanced">{users.find((user) => user.id === userId)?.username}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={userRoles[userId] || ''}
                                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                                        className="form-control-enhanced form-select-enhanced"
                                    >
                                        <option value="">Choisir un rôle</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            ))}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={handleClose} className="button-secondary-enhanced">
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSubmit} className="button-primary-enhanced">
                    Ajouter Projet
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateProjectModal;
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import '../../assets/styles/EditProjectModal.css';

const EditProjectModal = ({ show, handleClose, project, refreshProjects }) => {
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [userRoles, setUserRoles] = useState({});

    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: '',
        priority: '',
        selectedManager: '',
        selectedUsers: [],
        selectedDepartment: '',
    });

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

    useEffect(() => {
        if (project) {
            setFormData({
                project_name: project.project_name,
                description: project.description,
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
                status: project.status,
                priority: project.priority,
                selectedManager: project.manager?.id ? project.manager.id.toString() : '',
                selectedUsers: project.users ? project.users.map((user) => user.id.toString()) : [],
                selectedDepartment: project.departments?.[0]?.department_id ? project.departments[0].department_id.toString() : '',
            });

            const initialUserRoles = {};
            if (project.users_with_roles) {
                project.users_with_roles.forEach(userRole => {
                    initialUserRoles[userRole.user_id] = roles.find(role => role.name === userRole.role)?.id?.toString() || '';
                });
            }
            setUserRoles(initialUserRoles);
        }
    }, [project, roles]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSelectChange = (selectedOptions, field) => {
        const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        setFormData((prevState) => ({
            ...prevState,
            [field]: values,
        }));

        if (field === 'selectedUsers') {
            const newUserRoles = { ...userRoles };
            values.forEach(userId => {
                if (!newUserRoles[userId]) {
                    newUserRoles[userId] = '';
                }
            });

            Object.keys(newUserRoles).forEach(userId => {
                if (!values.includes(userId)) {
                    delete newUserRoles[userId];
                }
            });
            setUserRoles(newUserRoles);
        }
    };

    const handleRoleChange = (userId, roleId) => {
        setUserRoles((prevRoles) => ({
            ...prevRoles,
            [userId]: roleId,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project_name || !formData.description || !formData.status) {
            return;
        }

        const usersWithRoles = formData.selectedUsers.map(userId => ({
            user_id: parseInt(userId, 10),
            role_id: parseInt(userRoles[userId], 10) || null, // Ensure role_id is not undefined, send null if not selected

        const projectToUpdate = {
            project_name: formData.project_name,
            description: formData.description,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            status: formData.status,
            priority: formData.priority,
            department_id: parseInt(formData.selectedDepartment, 10),
            manager_id: parseInt(formData.selectedManager, 10),
            users: usersWithRoles,
        };

        try {
            await axios.put(`http://localhost:3000/projects/${project.project_id}`, projectToUpdate);
            refreshProjects();
            handleClose();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du projet', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="edit-project-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">Modifier le projet</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formProjectName" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Nom du projet</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="project_name"
                                    value={formData.project_name}
                                    onChange={handleInputChange}
                                    placeholder="Nom du projet"
                                    required
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formManager" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Chef de Projet</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="selectedManager"
                                    value={formData.selectedManager}
                                    onChange={handleInputChange}
                                    required
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
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Description du projet"
                                    required
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
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formEndDate" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Date de Fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
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
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
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
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    required
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
                                    name="selectedDepartment"
                                    value={formData.selectedDepartment}
                                    onChange={handleInputChange}
                                    required
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
                                    value={users.filter((user) => formData.selectedUsers.includes(user.id)).map((user) => ({
                                        value: user.id,
                                        label: user.username,
                                    }))}
                                    onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'selectedUsers')}
                                    className="react-select-container-enhanced"
                                    classNamePrefix="react-select-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Label className="form-label-enhanced">Rôles des membres</Form.Label>
                            {formData.selectedUsers.map((userId) => (
                                <Form.Group key={userId} controlId={`role-${userId}`} className="form-group-enhanced">
                                    <Form.Label className="form-label-enhanced">{users.find((user) => user.id === parseInt(userId, 10))?.username}</Form.Label>
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
                <Button variant="secondary" onClick={handleClose} className="button-secondary-enhanced">Annuler</Button>
                <Button variant="primary" type="submit" disabled={!formData.project_name || !formData.description || !formData.status} onClick={handleSubmit} className="button-primary-enhanced">
                    Enregistrer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProjectModal;
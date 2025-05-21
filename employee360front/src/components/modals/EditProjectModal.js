import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import { FaProjectDiagram, FaUserTie, FaAlignLeft, FaCalendarAlt, FaHourglassHalf, FaTachometerAlt, FaBuilding, FaUsers, FaCheckCircle, FaTimesCircle, FaEdit, FaChevronRight } from 'react-icons/fa'; // Import des icônes
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
        const values = selectedOptions ? selectedOptions.map((option) => option.value.toString()) : []; // Ensure string values
        setFormData((prevState) => ({
            ...prevState,
            [field]: values,
        }));

        if (field === 'selectedUsers') {
            const newUserRoles = { ...userRoles };
            values.forEach(userId => {
                // Keep existing role if user was already selected, otherwise initialize to empty
                if (!newUserRoles[userId]) {
                    const existingUserRole = project?.users_with_roles?.find(ur => ur.user_id.toString() === userId);
                    if (existingUserRole) {
                        newUserRoles[userId] = roles.find(role => role.name === existingUserRole.role)?.id?.toString() || '';
                    } else {
                        newUserRoles[userId] = '';
                    }
                }
            });

            // Remove roles for users no longer selected
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
            // Optionnel: Ajouter des messages d'erreur visuels
            return;
        }

        const usersWithRoles = formData.selectedUsers.map(userId => ({
            user_id: parseInt(userId, 10),
            role_id: parseInt(userRoles[userId], 10) || null,
        }));

        const projectToUpdate = {
            project_name: formData.project_name,
            description: formData.description,
            start_date: new Date(formData.start_date).toISOString().split('T')[0], // Format YYYY-MM-DD
            end_date: new Date(formData.end_date).toISOString().split('T')[0],   // Format YYYY-MM-DD
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
            // Gérer les erreurs (ex: afficher un message d'erreur à l'utilisateur)
        }
    };

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            border: state.isFocused ? '1px solid #007bff' : '1px solid #e0e0e0',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 123, 255, 0.25)' : 'none',
            borderRadius: '0 0.25rem 0.25rem 0', // Rounded on the right
            minHeight: '45px', // Match input height
            paddingLeft: '0.5rem',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                borderColor: '#007bff',
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0 8px',
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#6c757d', // Color of the dropdown arrow
            '&:hover': {
                color: '#007bff',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : null,
            color: state.isSelected ? 'white' : '#333',
            '&:active': {
                backgroundColor: '#0056b3',
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#007bff20', // Light blue background for selected tags
            borderRadius: '4px',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#007bff',
            fontWeight: 'bold',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#007bff',
            '&:hover': {
                backgroundColor: '#007bff',
                color: 'white',
            },
        }),
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="edit-project-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">
                    <FaEdit className="modal-title-icon" /> Modifier le Projet
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="formProjectName" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Nom du Projet</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaProjectDiagram /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="project_name"
                                        value={formData.project_name}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Refonte du site web"
                                        required
                                        className="form-control-styled"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formManager" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Chef de Projet</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaUserTie /></InputGroup.Text>
                                    <Form.Control
                                        as="select"
                                        name="selectedManager"
                                        value={formData.selectedManager}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    >
                                        <option value="">Sélectionner un chef de projet</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.username}</option>
                                        ))}
                                    </Form.Control>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={12}>
                            <Form.Group controlId="formDescription" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Description du Projet</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left input-icon-textarea-top"><FaAlignLeft /></InputGroup.Text>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Décrivez brièvement les objectifs, les livrables et le périmètre du projet."
                                        required
                                        className="form-control-styled"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="formStartDate" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Date de Début</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaCalendarAlt /></InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formEndDate" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Date de Fin Estimée</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaCalendarAlt /></InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="formStatus" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Statut</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaHourglassHalf /></InputGroup.Text>
                                    <Form.Control
                                        as="select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    >
                                        <option value="">Choisir un statut</option>
                                        {statuses.map((statusOption) => (
                                            <option key={statusOption} value={statusOption}>{statusOption}</option>
                                        ))}
                                    </Form.Control>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formPriority" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Priorité</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaTachometerAlt /></InputGroup.Text>
                                    <Form.Control
                                        as="select"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    >
                                        <option value="">Choisir une priorité</option>
                                        {priorities.map((priorityOption) => (
                                            <option key={priorityOption} value={priorityOption}>{priorityOption}</option>
                                        ))}
                                    </Form.Control>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="formDepartment" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Département Associé</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaBuilding /></InputGroup.Text>
                                    <Form.Control
                                        as="select"
                                        name="selectedDepartment"
                                        value={formData.selectedDepartment}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control-styled"
                                    >
                                        <option value="">Sélectionner un département</option>
                                        {departments.map((department) => (
                                            <option key={department.department_id} value={department.department_id}>
                                                {department.department_name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formUsers" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Membres de l'Équipe</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaUsers /></InputGroup.Text>
                                    <Select
                                        isMulti
                                        options={users.map((user) => ({
                                            value: user.id.toString(),
                                            label: user.username,
                                        }))}
                                        value={users.filter((user) => formData.selectedUsers.includes(user.id.toString())).map((user) => ({
                                            value: user.id.toString(),
                                            label: user.username,
                                        }))}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'selectedUsers')}
                                        className="react-select-container-styled"
                                        classNamePrefix="react-select-styled"
                                        placeholder="Sélectionner les membres"
                                        styles={customSelectStyles}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    {formData.selectedUsers.length > 0 && (
                        <div className="section-card">
                            <h5 className="section-title">
                                <FaChevronRight className="section-title-icon" /> Rôles des Membres
                            </h5>
                            <div className="roles-assignment-list">
                                {formData.selectedUsers.map((userId) => (
                                    <Form.Group key={userId} controlId={`role-${userId}`} className="form-group-enhanced role-assignment-item">
                                        <Form.Label className="user-role-label">
                                            {users.find((user) => user.id.toString() === userId)?.username}
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="input-icon-left"><FaCheckCircle /></InputGroup.Text>
                                            <Form.Control
                                                as="select"
                                                value={userRoles[userId] || ''}
                                                onChange={(e) => handleRoleChange(userId, e.target.value)}
                                                className="form-control-styled"
                                            >
                                                <option value="">Choisir un rôle pour ce membre</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </InputGroup>
                                    </Form.Group>
                                ))}
                            </div>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={handleClose} className="button-cancel">
                    <FaTimesCircle className="button-icon" /> Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={!formData.project_name || !formData.description || !formData.status} onClick={handleSubmit} className="button-primary">
                    <FaCheckCircle className="button-icon" /> Enregistrer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProjectModal;
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import { FaProjectDiagram, FaUserTie, FaAlignLeft, FaCalendarAlt, FaHourglassHalf, FaTachometerAlt, FaBuilding, FaUsers, FaCheckCircle, FaTimesCircle, FaPlus, FaChevronRight } from 'react-icons/fa'; // Ajout de FaChevronRight
import '../../assets/styles/CreateProjectModal.css';

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

    const handleSubmit = (e) => {
        e.preventDefault();

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
                role_id: parseInt(userRoles[userId], 10) || null
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
        <Modal show={show} onHide={handleClose} size="lg" centered className="create-project-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">
                    <FaPlus className="modal-title-icon" /> Nouveau Projet
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4"> {/* Added margin bottom for section separation */}
                        <Col md={6}>
                            <Form.Group controlId="formProjectName" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Nom du Projet</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="input-icon-left"><FaProjectDiagram /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ex: Refonte du site web"
                                        value={project_name}
                                        onChange={(e) => setProjectName(e.target.value)}
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
                                        value={selectedManager}
                                        onChange={(e) => setSelectedManager(e.target.value)}
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
                                        rows={3} // Increased rows for better initial view
                                        placeholder="Décrivez brièvement les objectifs, les livrables et le périmètre du projet."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
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
                                        value={start_date}
                                        onChange={(e) => setStartDate(e.target.value)}
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
                                        value={end_date}
                                        onChange={(e) => setEndDate(e.target.value)}
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
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
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
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
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
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
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
                                            value: user.id,
                                            label: user.username,
                                        }))}
                                        value={users.filter((user) => selectedUsers.includes(user.id)).map((user) => ({
                                            value: user.id,
                                            label: user.username,
                                        }))}
                                        onChange={(selectedOptions) => setSelectedUsers(selectedOptions ? selectedOptions.map((option) => option.value) : [])}
                                        className="react-select-container-styled"
                                        classNamePrefix="react-select-styled"
                                        placeholder="Sélectionner les membres"
                                        styles={customSelectStyles} // Apply custom styles here
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    {selectedUsers.length > 0 && (
                        <div className="section-card">
                            <h5 className="section-title">
                                <FaChevronRight className="section-title-icon" /> Rôles des Membres
                            </h5>
                            <div className="roles-assignment-list">
                                {selectedUsers.map((userId) => (
                                    <Form.Group key={userId} controlId={`role-${userId}`} className="form-group-enhanced role-assignment-item">
                                        <Form.Label className="user-role-label">
                                            {users.find((user) => user.id === userId)?.username}
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
                <Button variant="primary" type="submit" onClick={handleSubmit} className="button-primary">
                    <FaCheckCircle className="button-icon" /> Créer Projet
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateProjectModal;
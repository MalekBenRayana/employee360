import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import '../../assets/styles/DepartmentModal.css'

const DepartmentModal = ({ show, handleClose, department, refreshDepartments }) => {
    const isEditing = !!department;
    const [formData, setFormData] = useState({
        department_name: '',
        department_head_id: '',
        users_ids: [],
    });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs', error);
            }
        };

        fetchUsers();

        if (department) {
            setFormData({
                department_name: department.department_name || '',
                department_head_id: department.department_head?.id || '',
                users_ids: department.users?.map((user) => user.id) || [],
            });
        } else {
            setFormData({ department_name: '', department_head_id: '', users_ids: [] });
        }
    }, [department]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUsersChange = (selectedOptions) => {
        setFormData({ ...formData, users_ids: selectedOptions.map((option) => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const departmentData = {
            department_name: formData.department_name,
            department_head_id: formData.department_head_id,
            users_ids: formData.users_ids,
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:3000/departments/${department.department_id}`, departmentData);
            } else {
                await axios.post('http://localhost:3000/departments', departmentData);
            }
            refreshDepartments();
            handleClose();
        } catch (error) {
            console.error("Erreur lors de l'ajout/modification du département", error.response?.data || error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="department-modal-enhanced">
            <Modal.Header closeButton className="modal-header-enhanced">
                <Modal.Title className="modal-title-enhanced">{isEditing ? 'Modifier Département' : 'Ajouter Département'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-enhanced">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <Form.Group controlId="formDepartmentName" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Nom du Département</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="department_name"
                                    value={formData.department_name}
                                    onChange={handleChange}
                                    required
                                    className="form-control-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formDepartmentHead" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Responsable</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="department_head_id"
                                    value={formData.department_head_id}
                                    onChange={handleChange}
                                    required
                                    className="form-control-enhanced form-select-enhanced"
                                >
                                    <option value="">Sélectionner un responsable</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="formUsers" className="form-group-enhanced">
                                <Form.Label className="form-label-enhanced">Membres de Département</Form.Label>
                                <Select
                                    isMulti
                                    options={users.map((user) => ({
                                        value: user.id,
                                        label: user.username,
                                    }))}
                                    value={users.filter((user) => formData.users_ids.includes(user.id)).map((user) => ({
                                        value: user.id,
                                        label: user.username,
                                    }))}
                                    onChange={handleUsersChange}
                                    className="react-select-container-enhanced"
                                    classNamePrefix="react-select-enhanced"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer-enhanced">
                <Button variant="secondary" onClick={handleClose} className="button-secondary-enhanced">
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSubmit} className="button-primary-enhanced">
                    {isEditing ? 'Modifier' : 'Ajouter'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DepartmentModal;
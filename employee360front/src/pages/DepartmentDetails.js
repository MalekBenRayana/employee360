import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, ListGroup, Row, Col, Spinner, Button, Badge } from 'react-bootstrap';
import { HiArrowLeft, HiUser, HiBriefcase, HiMail, HiFolderOpen, HiInformationCircle, HiUserGroup  } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import '../assets/styles/departmentsdetails.css';
import { LayoutContext } from '../contexts/LayoutContext';

const DepartmentDetails = () => {
    const { departmentId } = useParams();
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext); 

    useEffect(() => {
        const fetchDepartmentDetails = async () => {
            if (departmentId) {
                try {
                    const response = await axios.get(`http://localhost:3000/departments/${departmentId}`);
                    setDepartment(response.data);
                } catch (err) {
                    setError("Erreur lors de la récupération des détails du département.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("ID de département invalide.");
                setLoading(false);
            }
        };

        fetchDepartmentDetails();
    }, [departmentId]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" className="loading-spinner" />
                <p className="loading-text">Chargement des détails du département...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <HiInformationCircle size={40} className="error-icon mb-3" />
                <p className="error-text">{error}</p>
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/department-management')}
                    className="error-button mt-3"
                >
                    <HiArrowLeft size={20} className="mr-2" />
                    Retour aux départements
                </Button>
            </div>
        );
    }

    const handleViewProjectDetails = (projectId) => {
        navigate(`/project-details/${projectId}`);
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="department-details-container mt-4">
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="department-header-card shadow-sm">
                                <Card.Body>
                                    <h2 className="department-title mb-3">{department.department_name}</h2>
                                    <div className="department-meta">
                                        <p><HiUser size={18} className="mr-2" /> <strong>Responsable:</strong> {department.department_head?.username || 'Non défini'}</p>
                                        <p><HiMail size={18} className="mr-2" /> <strong>Email:</strong> {department.department_head?.email || 'Non défini'}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Card className="department-section-card shadow-sm">
                                <Card.Header className="department-section-header">
                                    <HiUserGroup size={20} className="mr-2" /> Membres du département
                                </Card.Header>
                                <Card.Body>
                                    {department.users?.length > 0 ? (
                                        <ul className="department-members-list">
                                            {department.users.map((user) => (
                                                <li key={user.id} className="department-member-item">
                                                    <HiUser size={16} className="mr-2" /> {user.username}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-muted">Aucun membre dans ce département.</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="department-section-card shadow-sm">
                                <Card.Header className="department-section-header">
                                    <HiFolderOpen size={20} className="mr-2" /> Projets associés
                                </Card.Header>
                                <Card.Body>
                                    {department.projects?.length > 0 ? (
                                        <ul className="department-projects-list">
                                            {department.projects.map((project) => (
                                                <li key={project.project_id} className="department-project-item">
                                                    <HiBriefcase size={16} className="mr-2" />
                                                    <span
                                                        className="project-link"
                                                        onClick={() => handleViewProjectDetails(project.project_id)}
                                                        title="Consulter les détails du projet"
                                                    >
                                                        {project.project_name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-muted">Aucun projet associé à ce département.</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col>
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/department-management')}
                                className="back-button d-flex align-items-center"
                            >
                                <HiArrowLeft size={20} className="mr-2" />
                                Retour aux départements
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetails;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Button, Badge, ProgressBar, OverlayTrigger, Tooltip, ListGroup  } from 'react-bootstrap';
import { HiArrowLeft, HiInformationCircle, HiUserGroup, HiCalendar, HiTag, HiCheckCircle, HiPuzzle, HiClock } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import '../assets/styles/projectdetails.css';
import { LayoutContext } from '../contexts/LayoutContext';
import Avatar from 'react-avatar';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (projectId) {
                try {
                    const response = await axios.get(`http://localhost:3000/projects/${projectId}`);
                    setProject(response.data);
                    const totalTasks = response.data.tasks?.length || 1;
                    const completedTasks = response.data.tasks?.filter(task => task.status === 'Terminé')?.length || 0;
                    setProgress(Math.round((completedTasks / totalTasks) * 100));
                } catch (error) {
                    setError("Erreur lors de la récupération des détails du projet.");
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("ID de projet invalide.");
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    if (loading) {
        return (
            <div className="loading-spinner-advanced">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Chargement des détails du projet...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message-advanced">
                <HiInformationCircle size={40} className="mb-3" />
                {error}
                <Button onClick={() => navigate('/project-management')} className="mt-3">
                    Retour aux projets
                </Button>
            </div>
        );
    }

    const handleViewDepartmentDetails = (departmentId) => {
        navigate(`/department-details/${departmentId}`);
    };

    const getStatusBadge = (status) => {
        let variant = 'secondary';
        switch (status) {
            case 'En cours':
                variant = 'warning';
                break;
            case 'Terminé':
                variant = 'success';
                break;
            case 'En attente':
                variant = 'info';
                break;
            case 'Annulé':
                variant = 'danger';
                break;
            default:
                variant = 'secondary';
        }
        return <Badge pill bg={variant} className="status-badge">{status}</Badge>;
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'Haute':
                return <HiTag size={18} className="mr-1 text-danger" />;
            case 'Moyenne':
                return <HiTag size={18} className="mr-1 text-warning" />;
            case 'Basse':
                return <HiTag size={18} className="mr-1 text-success" />;
            default:
                return <HiTag size={18} className="mr-1 text-secondary" />;
        }
    };

    const isDeadlineApproaching = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="project-details-container mt-4">
                    <Row className="mb-4">
                        <Col md={12} className="project-overview">
                            
                            <div className="project-header-content">
                                <h1 className="project-title-enhanced">{project.project_name}</h1>
                                <div className="project-status-enhanced">
                                    <strong>Statut:</strong> {getStatusBadge(project.status)}
                                </div>
                                <p className="project-description-enhanced">{project.description}</p>
                            </div>
                        </Col>
                    </Row>

                    <Card className="shadow-sm mb-4 project-progress-card">
                        <Card.Body className="d-flex align-items-center">
                            <HiCheckCircle size={24} className="mr-2 text-success" />
                            <div className="flex-grow-1 mr-3">
                                <ProgressBar now={progress} label={`${progress}% Complété`} />
                            </div>
                            <small className="text-muted">{progress}%</small>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={8}>
                            <Card className="shadow-sm mb-4 project-details-card">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0"><HiPuzzle size={20} className="mr-2" /> Détails du Projet</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="detail-item">
                                            <strong>Description:</strong> <p className="mb-0">{project.description}</p>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="detail-item">
                                            <strong>Chef de projet:</strong> {project.manager.username}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="detail-item department-item d-flex justify-content-between align-items-center">
                                            <span>
                                                <strong>Département:</strong>
                                                <span
                                                    className="department-link-advanced"
                                                    onClick={() => handleViewDepartmentDetails(project.departments?.[0]?.department_id)}
                                                >
                                                    {project.departments?.[0]?.department_name || "Non attribué"}
                                                </span>
                                            </span>
                                            {project.departments?.[0]?.department_id && (
                                                <HiInformationCircle
                                                    size={20}
                                                    color="#007bff"
                                                    className="department-info-icon-advanced"
                                                    onClick={() => handleViewDepartmentDetails(project.departments[0].department_id)}
                                                    title="Consulter les détails du département"
                                                />
                                            )}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="detail-item d-flex align-items-center">
                                            <strong>Date de début:</strong> {new Date(project.start_date).toLocaleDateString()}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="detail-item d-flex align-items-center">
                                            <strong>Date de fin:</strong> {new Date(project.end_date).toLocaleDateString()}
                                            {isDeadlineApproaching(project.end_date) && <HiClock size={18} className="ml-2 text-warning" />}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="detail-item d-flex align-items-center">
                                            <strong>Priorité:</strong> {getPriorityIcon(project.priority)} {project.priority}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm mb-4 team-card">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0"><HiUserGroup size={20} className="mr-2" /> Équipe</h5>
                                </Card.Header>
                                <Card.Body className="team-list-advanced">
                                    {project.users.map((user) => (
                                        <OverlayTrigger
                                            key={user.id}
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tooltip-${user.id}`}>
                                                    {user.email}
                                                </Tooltip>
                                            }
                                        >
                                            <div className="team-member-card">
                                                <Avatar name={user.username} size="40" round={true} className="mr-2" />
                                                <span>{user.username}</span>
                                            </div>
                                        </OverlayTrigger>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/project-management')}
                                className="d-flex align-items-center back-button-advanced"
                            >
                                <HiArrowLeft size={20} className="mr-2" />
                                Retour aux projets
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
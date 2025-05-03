import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { HiPencilAlt, HiTrash, HiEye, HiPlusCircle } from 'react-icons/hi';
import { OverlayTrigger, Tooltip, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EditProjectModal from '../components/modals/EditProjectModal';
import CreateProjectModal from '../components/modals/CreateProjectModal ';
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { HiBriefcase } from 'react-icons/hi';
const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3000/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets', error);
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleViewProjectDetails = (id) => {
        navigate(`/project-details/${id}`);
    };

    const handleEditProject = (id) => {
        const project = projects.find(p => p.project_id === id);
        setSelectedProject(project);
        setShowEditProjectModal(true);
    };

    const handleDeleteProject = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/projects/${id}`);
            setProjects(projects.filter((project) => project.project_id !== id));
        } catch (error) {
            console.error(`Erreur lors de la suppression du projet ${id}`, error);
        }
    };

    const refreshProjects = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3000/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets après modification', error);
        }
    }, []);

    // Animation pour le titre
    const titleAnimation = useSpring({
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { mass: 1, tension: 170, friction: 26 },
    });

    const projectStatusData = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(projectStatusData).map(([name, value]) => ({ name, value }));

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <motion.div style={titleAnimation} className="mb-4">
                        <h2 className="text-primary fw-bold">Gestion des Projets</h2>
                    </motion.div>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Projets</h6>
                                        <h4 className="mb-0 fw-bold text-info">{projects.length}</h4>
                                    </div>
                                    <HiBriefcase size={32} className="text-info" />
                                </Card.Body>
                            </Card>
                        </Col>
                        {Object.entries(projectStatusData).map(([status, count]) => (
                            <Col md={4} key={status}>
                                <Card className="shadow-sm border-0 rounded-lg">
                                    <Card.Body className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-1">Projets {status}</h6>
                                            <h4 className="mb-0 fw-bold" style={{ color: status === 'en cours' ? 'green' : status === 'Terminé' ? 'blue' : 'orange' }}>{count}</h4>
                                        </div>
                                        <HiEye size={32} style={{ color: status === 'en cours' ? 'green' : status === 'Terminé' ? 'blue' : 'orange' }} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Liste des Projets</h5>
                                <Button variant="success" onClick={() => setShowCreateProjectModal(true)} className="btn-sm">
                                    <HiPlusCircle className="me-1" /> Ajouter Projet
                                </Button>
                            </div>
                            {loadingProjects ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Nom</th>
                                                <th>Statut</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map((project) => (
                                                <motion.tr
                                                    key={project.project_id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td>{project.project_name}</td>
                                                    <td>
                                                        <span className={`badge bg-${project.status === 'en cours' ? 'success' : project.status === 'Terminé' ? 'primary' : 'warning'}`}>
                                                            {project.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
                                                            <Button
                                                                variant="outline-warning"
                                                                onClick={() => handleEditProject(project.project_id)}
                                                                className="btn-sm rounded-circle me-2"
                                                            >
                                                                <HiPencilAlt size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                                                            <Button
                                                                variant="outline-danger"
                                                                onClick={() => handleDeleteProject(project.project_id)}
                                                                className="btn-sm rounded-circle me-2"
                                                            >
                                                                <HiTrash size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Consulter</Tooltip>}>
                                                            <Button
                                                                variant="outline-info"
                                                                onClick={() => handleViewProjectDetails(project.project_id)}
                                                                className="btn-sm rounded-circle"
                                                            >
                                                                <HiEye size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {chartData.length > 0 && (
                        <Card className="shadow-sm mt-4 border-primary">
                            <Card.Body>
                                <h6 className="card-title mb-3 fw-bold text-primary">Répartition des Projets par Statut</h6>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ChartTooltip />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    )}

                    {selectedProject && (
                        <EditProjectModal
                            show={showEditProjectModal}
                            handleClose={() => setShowEditProjectModal(false)}
                            project={selectedProject}
                            refreshProjects={refreshProjects}
                        />
                    )}

                    <CreateProjectModal
                        show={showCreateProjectModal}
                        handleClose={() => setShowCreateProjectModal(false)}
                        handleCreateProject={refreshProjects}
                        users={[]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectManagement;
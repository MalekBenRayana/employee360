import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    styled,
    Badge,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutContext } from '../contexts/LayoutContext';
import { FaProjectDiagram, FaPlay, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const ProjectCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    textAlign: 'left',
    cursor: 'pointer',
    padding: theme.spacing(2),
}));

const ProjectCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(2),
    '&:last-child': {
        paddingBottom: theme.spacing(2),
    },
}));

const PriorityTag = styled(Box)(({ theme, priority }) => ({
    backgroundColor:
        priority === 'HAUTE' ? theme.palette.error.dark :
        priority === 'MOYENNE' ? theme.palette.warning.main :
        theme.palette.info.main,
    color: theme.palette.common.white,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    display: 'inline-block',
}));

function ManagerDashboard() {
    const { userId: managerId } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);

    const fetchManagedProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            if (managerId) {
                const response = await axios.get(`http://localhost:3000/projects/manager/${managerId}`);
                setProjects(response.data);
            } else {
                setError("L'ID du manager n'est pas disponible.");
            }
        } catch (err) {
            setError("Erreur lors de la récupération des projets du manager.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagedProjects();
    }, [managerId]);

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-5">
                    <div className="text-center mb-5">
                        <h2 className="display-4 text-primary font-weight-bold mb-3">
                            <FaProjectDiagram className="me-2" /> Tableau de Bord du Manager
                        </h2>
                    </div>

                    {error && <div className="alert alert-danger shadow-sm">{error}</div>}

                    {loading ? (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2 text-muted">Chargement des projets...</p>
                        </div>
                    ) : (
                        <Grid container spacing={3}>
                            {projects.map((project) => (
                                <Grid item xs={12} md={6} lg={4} key={project.project_id}>
                                    <ProjectCard>
                                        <CardActionArea onClick={() => handleProjectClick(project.project_id)}>
                                            <ProjectCardContent>
                                                <Typography variant="h6" component="h3" gutterBottom style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                                                    {project.project_name}
                                                </Typography>
                                                <PriorityTag priority={project.priority}>{project.priority}</PriorityTag>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    ID: {project.project_id}
                                                </Typography>
                                                <Box display="flex" alignItems="center" mb={0.5}>
                                                    {project.status === 'Terminé' && <FaCheckCircle color="success" className="me-1" />}
                                                    {project.status === 'En cours' && <FaPlay color="primary" className="me-1" />}
                                                    {project.status === 'En attente' && <FaClock color="warning" className="me-1" />}
                                                    {project.status !== 'Terminé' && project.status !== 'En cours' && project.status !== 'En attente' && <FaExclamationTriangle color="error" className="me-1" />}
                                                    <Typography variant="body2" color="textSecondary">
                                                        Statut: <span style={{ fontWeight: 'bold' }}>{project.status}</span>
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="textSecondary">
                                                    Début: {project.start_date.slice(0, 10)}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Fin: {project.end_date.slice(0, 10)}
                                                </Typography>
                                                {project.departments && project.departments.length > 0 && (
                                                    <Box mt={1}>
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            Département(s):
                                                        </Typography>
                                                        {project.departments.map((dept) => (
                                                            <Badge key={dept.department_id} color="secondary" sx={{ mr: 0.5, mb: 0.5 }}>
                                                                {dept.department_name}
                                                            </Badge>
                                                        ))}
                                                    </Box>
                                                )}
                                                {project.users && project.users.length > 0 && (
                                                    <Box mt={1}>
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            Collaborateur(s):
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {project.users.slice(0, 3).map(user => user.username).join(', ')}
                                                            {project.users.length > 3 && ` +${project.users.length - 3}`}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </ProjectCardContent>
                                        </CardActionArea>
                                    </ProjectCard>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
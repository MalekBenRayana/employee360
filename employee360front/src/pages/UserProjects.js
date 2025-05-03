import React, { useEffect, useState, useContext } from 'react';
import axios from '../axios';
import { useAuth } from '../auth/AuthContext';
import { FaProjectDiagram, FaFilter, FaSortAmountDown, FaCircleNotch, FaCheckCircle, FaHourglass, FaFlag, FaClock, FaHourglassHalf } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import '../assets/styles/UserProjects.css';
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';

const UserProjects = () => {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(6);
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const { collapsed } = useContext(LayoutContext);

    const priorityColors = {
        HAUTE: '#dc3545',
        MÉDIUM: '#ffc107',
        BASSE: '#28a745',
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(response.data.projects);
        } catch (error) {
            setError('Impossible de récupérer les projets.');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [token]);

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(projects.length / projectsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="user-projects-container container-fluid py-5">
                    <div className="user-projects-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="user-projects-title display-5 fw-bold text-primary mb-1">
                                <FaProjectDiagram className="me-2" /> Mes Projets
                            </h2>
                            <p className="user-projects-subtitle lead text-secondary">
                                Visualisez et gérez l'avancement de vos projets assignés.
                            </p>
                        </div>
                        {/* Options de filtrage/tri (à implémenter) */}
                        {/* <div className="d-flex">
                            <button className="btn btn-outline-secondary btn-sm me-2"><FaFilter className="me-1" /> Filtrer</button>
                            <button className="btn btn-outline-secondary btn-sm"><FaSortAmountDown className="me-1" /> Trier</button>
                        </div> */}
                    </div>

                    {error && <div className="alert alert-danger shadow-sm">{error}</div>}

                    {projects.length > 0 ? (
                        <>
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
                                {currentProjects.map((project, index) => (
                                    <div key={index} className="col">
                                        <div className="project-card shadow-sm h-100 rounded-3">
                                            <div className="project-card-body p-3 d-flex flex-column justify-content-between h-100">
                                                <div>
                                                    <h5 className="project-title text-truncate fw-bold text-secondary mb-2">{project.project_name}</h5>
                                                    <div className="project-meta mb-2">
                                                        <strong className="text-muted small">Statut :</strong>
                                                        <span
                                                            className={`status-badge ms-2 rounded-pill px-2 py-1 small fw-bold ${
                                                                project.status === 'En cours' ? 'bg-success text-white' :
                                                                project.status === 'Terminé' ? 'bg-primary text-white' :
                                                                project.status === 'En attente' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                            }`}
                                                        >
                                                            {project.status === 'en cours' ? <FaHourglassHalf className="me-1" /> : project.status === 'Terminé' ? <FaCheckCircle className="me-1" /> : project.status === 'En attente' ? <FaClock className="me-1" /> : ''}
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                    <div className="project-meta">
                                                        <strong className="text-muted small">Priorité :</strong>
                                                        <span
                                                            className="priority-badge ms-2 rounded-pill px-2 py-1 small fw-bold"
                                                            style={{ backgroundColor: priorityColors[project.priority] || '#f0f0f0', color: priorityColors[project.priority] ? '#fff' : '#333' }}
                                                        >
                                                            <FaFlag className="me-1" /> {project.priority}
                                                        </span>
                                                    </div>
                                                    {/* Ajouter ici d'autres informations pertinentes du projet */}
                                                </div>
                                                <div className="mt-3">
                                                    <button className="project-details-button btn btn-outline-primary btn-sm rounded-pill px-3">
                                                        Voir détails
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <nav className="pagination-container d-flex justify-content-center">
                                <ul className="pagination">
                                    {pageNumbers.map((number) => (
                                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                            <button onClick={() => paginate(number)} className="page-link rounded-pill">
                                                {number}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </>
                    ) : (
                        <div className="no-projects text-center py-5">
                            <FaProjectDiagram size={48} className="text-muted mb-3" />
                            <p className="lead text-muted">Aucun projet assigné pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProjects;
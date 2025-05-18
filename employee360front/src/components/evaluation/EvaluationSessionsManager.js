import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import '../../assets/styles/evaluation-sessions-manager.css';
import { FaPlus, FaChartPie, FaCheckCircle, FaListAlt, FaEdit, FaTrash, FaChartBar } from 'react-icons/fa';
import { Card, Row, Col } from 'react-bootstrap';
import { fetchEvaluationSessions, deleteEvaluationSession } from '../../services/evaluationSessionService';

const EvaluationSessionsManager = () => {
    const { collapsed } = useContext(LayoutContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSessions = async () => {
            setLoading(true);
            try {
                const data = await fetchEvaluationSessions();
                setSessions(data);
            } catch (err) {
                setError('Erreur lors de la récupération des sessions d\'évaluation.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    const handleDeleteSession = async (sessionId) => {
        try {
            await deleteEvaluationSession(sessionId);
            setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
            console.log(`Session avec l'ID ${sessionId} supprimée.`);
        } catch (err) {
            setError('Erreur lors de la suppression de la session.');
            console.error(err);
        }
    };

    const totalSessions = sessions.length;
    const openSessions = sessions.filter(session => session.status === 'open').length;
    const activeSessions = sessions.filter(session => session.status === 'active').length;
    const closedSessions = sessions.filter(session => session.status === 'closed').length;

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid py-5 loading-container">
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                        <p className="mt-2 text-muted">Chargement des sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid py-5 error-message alert alert-danger shadow-sm">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-5 evaluation-sessions-manager-container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="display-4 text-primary font-weight-bold">Gestion des Sessions d'Évaluation</h2>
                        <Link to="/evaluation-sessions/create" className="btn btn-primary rounded-pill shadow-sm font-weight-bold">
                            <FaPlus className="me-2" /> Ouvrir une Session
                        </Link>
                    </div>

                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Sessions</h6>
                                        <h4 className="mb-0 fw-bold text-info">{totalSessions}</h4>
                                    </div>
                                    <FaListAlt size={32} className="text-info" />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Ouvertes</h6>
                                        <h4 className="mb-0 fw-bold text-success">{openSessions}</h4>
                                    </div>
                                    <FaCheckCircle size={32} className="text-success" />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Fermées</h6>
                                        <h4 className="mb-0 fw-bold text-secondary">{closedSessions}</h4>
                                    </div>
                                    <FaChartPie size={32} className="text-secondary" />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {sessions.length > 0 ? (
                        <div className="card shadow-lg rounded-3 border-0">
                            <div className="card-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Formulaire</th>
                                                <th>Évaluateur(s)</th>
                                                <th>Projet</th>
                                                <th>Statut</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.map(session => (
                                                <tr key={session.id}>
                                                    <td>{session.form ? session.form.name : 'N/A'}</td>
                                                    <td>
                                                        {session.evaluatorAssignments && Array.isArray(session.evaluatorAssignments)
                                                            ? session.evaluatorAssignments
                                                                .map(assignment => assignment.evaluator ? assignment.evaluator.username : 'N/A')
                                                                .join(', ')
                                                            : 'N/A'}
                                                    </td>
                                                    <td>{session.project ? session.project.project_name : 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill bg-${session.status === 'open' ? 'success' : session.status === 'active' ? 'info' : 'secondary'}`}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Link to={`/evaluation-sessions/edit/${session.id}`} className="btn btn-sm btn-outline-primary rounded-pill me-2" title="Modifier">
                                                            <FaEdit />
                                                        </Link>
                                                        <button onClick={() => handleDeleteSession(session.id)} className="btn btn-sm btn-outline-danger rounded-pill" title="Supprimer">
                                                            <FaTrash />
                                                        </button>
                                                        <Link to={`/evaluation-sessions/stats/${session.id}`} className="btn btn-sm btn-outline-info rounded-pill ms-2" title="Statistiques">
                                                            <FaChartBar />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info shadow-sm">Aucune session d'évaluation n'a été trouvée.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationSessionsManager;
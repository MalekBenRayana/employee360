import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import '../../assets/styles/evaluation-response-detail.css';
import { fetchResponseDetail } from '../../services/evaluationResponseService';

const EvaluationResponseDetail = () => {
    const { responseId } = useParams();
    const [responseDetail, setResponseDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);

    useEffect(() => {
        const loadResponseDetail = async () => {
            setLoading(true);
            try {
                const data = await fetchResponseDetail(responseId);
                setResponseDetail(data);
            } catch (err) {
                setError('Erreur lors de la récupération du détail de la réponse.');
                console.error('Erreur de récupération du détail de la réponse:', err);
            } finally {
                setLoading(false);
            }
        };

        loadResponseDetail();
    }, [responseId]);

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid py-5 loading-container">
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                        <p className="mt-2 text-muted">Chargement du détail de la réponse...</p>
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
                <div className="container-fluid py-5 evaluation-response-detail-container">
                    <div className="mb-4">
                        <Link to={`/evaluation-forms/${responseDetail?.session?.form?.id || ''}/responses`} className="btn btn-outline-secondary rounded-pill me-2 shadow-sm">
                            <FaArrowLeft className="me-2" /> Retour aux Réponses
                        </Link>
                        <h2 className="display-4 text-primary font-weight-bold mt-3">
                            Détail de la Réponse #{responseId}
                        </h2>
                        <p className="lead text-secondary">Visualisation détaillée de la réponse soumise.</p>
                    </div>

                    {responseDetail && responseDetail.answers && (
                        <div className="card shadow-lg rounded-3 border-0">
                            <div className="card-body p-4">
                                <h5 className="font-weight-bold text-muted mb-3">Réponses</h5>
                                {Object.entries(responseDetail.answers).map(([questionLabel, answer]) => (
                                    <div key={questionLabel} className="mb-3">
                                        <h6 className="font-weight-bold text-info">{questionLabel}</h6>
                                        <p className="text-secondary">{answer}</p>
                                    </div>
                                ))}
                                <div className="mt-4">
                                    <h6 className="font-weight-bold text-muted">Informations Supplémentaires</h6>
                                    <p className="text-secondary">Date de soumission: {new Date(responseDetail.submittedAt).toLocaleString()}</p>
                                    <p className="text-secondary">Évaluateur: {responseDetail.evaluator?.username || 'N/A'}</p>
                                    <p className="text-secondary">Employé Évalué: {responseDetail.evaluatee?.username || 'N/A'}</p>
                                    {responseDetail.score !== null && (
                                        <p className="text-secondary">Score: {responseDetail.score.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationResponseDetail;
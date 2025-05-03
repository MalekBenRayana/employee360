import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaEye } from 'react-icons/fa';
import '../../assets/styles/evaluation-response-list.css';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import { fetchResponsesByFormId } from '../../services/evaluationResponseService';

const EvaluationResponseList = () => {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);

    useEffect(() => {
        const loadResponsesForForm = async () => {
            setLoading(true);
            try {
                const data = await fetchResponsesByFormId(formId);
                setResponses(data);
            } catch (err) {
                setError('Erreur lors de la récupération des réponses pour ce formulaire.');
                console.error('Erreur de récupération des réponses:', err);
            } finally {
                setLoading(false);
            }
        };

        loadResponsesForForm();
    }, [formId]);

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid py-5 loading-container">
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                        <p className="mt-2 text-muted">Chargement des réponses...</p>
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
                <div className="container-fluid py-5 evaluation-response-list-container">
                    <div className="mb-4">
                        <Link to="/evaluation-forms" className="btn btn-outline-secondary rounded-pill me-2 shadow-sm">
                            <FaArrowLeft className="me-2" /> Retour aux Formulaires
                        </Link>
                        <h2 className="display-4 text-primary font-weight-bold mt-3">
                            Réponses pour le Formulaire #{formId}
                        </h2>
                        <p className="lead text-secondary">Liste des réponses soumises pour ce formulaire.</p>
                    </div>

                    {responses.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded-3 shadow-sm">
                                <thead className="bg-light">
                                    <tr>
                                        <th>ID Réponse</th>
                                        <th>Évaluateur</th>
                                        <th>Employé Évalué</th>
                                        <th>Date de Soumission</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map(response => (
                                        <tr key={response.id}>
                                            <td>{response.id}</td>
                                            <td>{response.evaluator?.username || 'N/A'}</td>
                                            <td>{response.evaluatee?.username || 'N/A'}</td>
                                            <td>{response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'N/A'}</td>
                                            <td>
                                                <Link to={`/evaluation-responses/${response.id}`} className="btn btn-sm btn-outline-info rounded-pill shadow-sm">
                                                    <FaEye className="me-2" /> Détails
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-info shadow-sm">Aucune réponse n'a été soumise pour ce formulaire.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationResponseList;
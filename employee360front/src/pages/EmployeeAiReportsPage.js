import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import {
    FaFileAlt, FaArrowLeft, FaEye, FaCalendarAlt, FaBrain, FaStar, // Rapport général
    FaPlusCircle, FaMinusCircle, FaLightbulb, FaChartLine, // Sections spécifiques
    FaThumbsUp, FaThumbsDown, FaBullseye, FaChartBar // Pour les sections de forces, améliorations, etc.
} from 'react-icons/fa';
import { MdOutlineInsights, MdOutlineTrendingUp, MdOutlineTrendingDown } from "react-icons/md"; // Pour des icônes plus spécifiques si Fa n'est pas suffisant
import '../assets/styles/EmployeeAiReportsPage.css'; // Crée ou met à jour ce fichier CSS
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';

const EmployeeAiReportsPage = () => {
    const { employeeId } = useParams();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const { collapsed } = useContext(LayoutContext);

    useEffect(() => {
        const fetchReports = async () => {
            if (!employeeId || !token) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/ai-evaluation-reports/by-evaluatee/${employeeId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Trier les rapports par date de création (du plus récent au plus ancien)
                const sortedReports = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setReports(sortedReports);
            } catch (err) {
                console.error("Erreur lors de la récupération des rapports AI:", err);
                setError('Impossible de récupérer les rapports d\'évaluation AI.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [employeeId, token]);

    const fetchReportDetails = async (responseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/ai-evaluation-reports/by-response/${responseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedReport(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération du rapport AI détaillé:", err);
            setError('Impossible de récupérer les détails du rapport AI.');
        } finally {
            setLoading(false);
        }
    };

    // Helper component for a section card
    const ReportSectionCard = ({ title, icon, children, className = '' }) => (
        <div className={`report-section-card ${className}`}>
            <div className="report-section-header">
                {icon && <span className="section-icon">{icon}</span>}
                <h3 className="section-title">{title}</h3>
            </div>
            <div className="section-content">
                {children}
            </div>
        </div>
    );

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-4 ai-reports-container">
                    <h1 className="main-title mb-4">
                        <FaFileAlt style={{ marginRight: '10px' }} /> Mes Rapports d'Évaluation IA
                    </h1>

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2 text-muted">Chargement des données...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger shadow-sm professional-alert">{error}</div>
                    ) : selectedReport ? (
                        // Vue détaillée d'un rapport
                        <div className="report-detail-view">
                            <button className="btn btn-outline-secondary mb-4 back-button" onClick={() => setSelectedReport(null)}>
                                <FaArrowLeft style={{ marginRight: '8px' }} /> Retour à la liste des rapports
                            </button>

                            <div className="report-header-summary">
                                <FaFileAlt className="report-main-icon" />
                                <h2>Rapport d'Évaluation IA du {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                                {selectedReport.reportContent?.performanceStatistics?.averageScore !== undefined && (
                                    <p className="overall-score-display">
                                        <FaChartBar /> Score Moyen Général : <strong>{selectedReport.reportContent.performanceStatistics.averageScore.toFixed(2)}%</strong>
                                    </p>
                                )}
                            </div>

                            <div className="report-sections-grid">
                                {selectedReport.reportContent?.overallSummary && (
                                    <ReportSectionCard title="Résumé Général" icon={<FaBrain color="#3498db" />}>
                                        <p>{selectedReport.reportContent.overallSummary}</p>
                                    </ReportSectionCard>
                                )}

                                {selectedReport.reportContent?.strengths && selectedReport.reportContent.strengths.length > 0 && (
                                    <ReportSectionCard title="Points Forts" icon={<FaThumbsUp color="#28a745" />}>
                                        <ul>
                                            {selectedReport.reportContent.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </ReportSectionCard>
                                )}

                                {selectedReport.reportContent?.areasForImprovement && selectedReport.reportContent.areasForImprovement.length > 0 && (
                                    <ReportSectionCard title="Axes d'Amélioration" icon={<FaThumbsDown color="#dc3545" />}>
                                        <ul>
                                            {selectedReport.reportContent.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </ReportSectionCard>
                                )}

                                {selectedReport.reportContent?.specificRecommendations && selectedReport.reportContent.specificRecommendations.length > 0 && (
                                    <ReportSectionCard title="Recommandations Spécifiques" icon={<FaLightbulb color="#ffc107" />}>
                                        <ul>
                                            {selectedReport.reportContent.specificRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </ReportSectionCard>
                                )}

                                {selectedReport.reportContent?.performanceStatistics && (
                                    <ReportSectionCard title="Statistiques Clés" icon={<FaChartLine color="#6f42c1" />} className="full-width-card">
                                        <div className="stats-grid">
                                            {selectedReport.reportContent.performanceStatistics.averageScore !== undefined && (
                                                <div className="stat-item">
                                                    <MdOutlineInsights size={20} color="#007bff" />
                                                    <span>Score Global : <strong>{selectedReport.reportContent.performanceStatistics.averageScore.toFixed(2)}%</strong></span>
                                                </div>
                                            )}
                                            {selectedReport.reportContent.performanceStatistics.highestScoreCategory && (
                                                <div className="stat-item">
                                                    <MdOutlineTrendingUp size={20} color="#28a745" />
                                                    <span>Point Fort : <strong>{selectedReport.reportContent.performanceStatistics.highestScoreCategory}</strong></span>
                                                </div>
                                            )}
                                            {selectedReport.reportContent.performanceStatistics.lowestScoreCategory && (
                                                <div className="stat-item">
                                                    <MdOutlineTrendingDown size={20} color="#dc3545" />
                                                    <span>Point à Améliorer : <strong>{selectedReport.reportContent.performanceStatistics.lowestScoreCategory}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </ReportSectionCard>
                                )}

                              

                                {selectedReport.reportContent?.conclusion && (
                                    <ReportSectionCard title="Conclusion du Rapport" icon={<FaStar color="#ffc107" />} className="full-width-card">
                                        <p>{selectedReport.reportContent.conclusion}</p>
                                    </ReportSectionCard>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Liste des rapports
                        reports.length > 0 ? (
                            <div className="reports-list-grid">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="report-summary-card interactive-card"
                                        onClick={() => fetchReportDetails(report.evaluationResponseId)}
                                    >
                                        <div className="card-icon-container">
                                            <FaFileAlt size={30} color="#007bff" />
                                        </div>
                                        <div className="card-content">
                                            <h4>Rapport du {new Date(report.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                            <p className="summary-text">{report.overallSummary || "Pas de résumé disponible"}</p>
                                            {report.reportContent?.performanceStatistics?.averageScore !== undefined && (
                                                <p className="average-score-preview">
                                                    Score Moyen : <strong>{report.reportContent.performanceStatistics.averageScore.toFixed(2)}%</strong>
                                                </p>
                                            )}
                                            <button className="btn btn-primary btn-sm view-details-button">
                                                <FaEye style={{ marginRight: '5px' }} /> Voir les détails
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-reports-message professional-alert">
                                <p>Aucun rapport d'évaluation IA disponible pour le moment.</p>
                                <p className="text-muted">Les rapports seront générés après la soumission et le traitement de vos évaluations.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeAiReportsPage;
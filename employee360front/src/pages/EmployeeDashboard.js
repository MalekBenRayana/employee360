import React, { useState, useEffect, useContext } from 'react';
import dashboardService from '../services/dashboard.service';
import Navbar from '../components/Navbar';
import { LayoutContext } from '../contexts/LayoutContext';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
} from 'recharts';
import { FaChartBar, FaListOl, FaChartLine } from 'react-icons/fa';
import axios from '../axios';
import { useAuth } from '../auth/AuthContext';
import '../assets/styles/EmployeeDashboard.css';

const TotalEvaluationsCard = ({ count }) => (
    <div className="totalEvaluationsCard">
        <h3 className="title">
            <FaListOl style={{ marginRight: '8px' }} /> Nombre Total d'Évaluations
        </h3>
        <p className="count">{count}</p>
    </div>
);

const ScoreHistoryChart = ({ data }) => {
    const chartData = data?.dates?.map((date, index) => ({
        date: date,
        'Score Moyen': data?.scores?.[index],
    })) || [];

    return (
        <div className="scoreHistoryChart">
            <h3 className="title">
                <FaChartLine style={{ marginRight: '8px' }} /> Historique des Scores Moyens
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '0.9em', color: '#555' }} />
                    <YAxis style={{ fontSize: '0.9em', color: '#555' }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip labelStyle={{ color: '#333' }} itemStyle={{ color: '#555' }} />
                    <Legend wrapperStyle={{ top: 0, right: 0, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '1.5em' }} />
                    <Line type="monotone" dataKey="Score Moyen" stroke="#28a745" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const PerformancePointChart = ({ data }) => {
    const chartData = Object.keys(data || {}).map(key => ({
        name: key,
        'Score Moyen': data[key],
    }));

    return (
        <div className="performancePointChart">
            <h3 className="title">
                <FaChartBar style={{ marginRight: '8px' }} /> Scores Moyens par Point de Performance
            </h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        style={{ fontSize: '0.9em', color: '#555', textAnchor: 'end' }}
                        tick={{ angle: -45, dx: -10, dy: 15 }}
                    />
                    <YAxis style={{ fontSize: '0.9em', color: '#555' }} domain={[0, 'dataMax + 1']} />
                    <Tooltip labelStyle={{ color: '#333' }} itemStyle={{ color: '#555' }} />
                    <Legend wrapperStyle={{ top: 0, right: 0, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '1.5em' }} />
                    <Bar dataKey="Score Moyen" fill="#007bff" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

 
};

const EmployeeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [scoreHistory, setScoreHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);
    const [employeeId, setEmployeeId] = useState(null);
    const { token, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchEmployeeId = async () => {
            if (token && !authLoading) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get('/users/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setEmployeeId(response.data.userId);
                } catch (err) {
                    setError('Impossible de récupérer l\'ID de l\'utilisateur.');
                    setLoading(false);
                }
            }
        };
        fetchEmployeeId();
    }, [token, authLoading]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (employeeId) {
                setLoading(true);
                setError(null);
                try {
                    const statsData = await dashboardService.getEvaluateeStats(employeeId);
                    setStats(statsData);

                    const historyData = await dashboardService.getEvaluateeScoreHistory(employeeId);
                    setScoreHistory(historyData);
                } catch (err) {
                    console.error("Erreur lors de la récupération des données du tableau de bord:", err);
                    setError(err.message || 'Erreur lors de la récupération des données du tableau de bord.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDashboardData();
    }, [employeeId]);

    if (loading) {
        return <div>Chargement des données du tableau de bord...</div>;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

    if (!stats || !scoreHistory) {
        return <div>Aucune donnée de tableau de bord disponible.</div>;
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-4">
                    <h1 className="mb-4" style={{ color: '#333' }}>Tableau de Bord de l'Employé {employeeId}</h1>
                    <div className="row">
                        {stats?.totalEvaluations !== undefined && (
                            <div
                                className="col-md-6 mb-4 totalEvaluationsCard"
                                onMouseOver={(e) => e.currentTarget.classList.add('totalEvaluationsCard:hover')}
                                onMouseOut={(e) => e.currentTarget.classList.remove('totalEvaluationsCard:hover')}
                            >
                                <TotalEvaluationsCard count={stats.totalEvaluations} />
                            </div>
                        )}

                        {scoreHistory?.dates?.length > 0 && scoreHistory?.scores?.length > 0 && (
                            <div className="col-md-6 mb-4 scoreHistoryChart">
                                <ScoreHistoryChart data={scoreHistory} />
                            </div>
                        )}

                        {stats?.averageScoresByPerformancePoint && Object.keys(stats.averageScoresByPerformancePoint).length > 0 && (
                            <div className="col-md-12 mb-4 performancePointChart">
                                <PerformancePointChart data={stats.averageScoresByPerformancePoint} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
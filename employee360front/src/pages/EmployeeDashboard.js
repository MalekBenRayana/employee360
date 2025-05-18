import React, { useState, useEffect, useContext } from 'react';
import dashboardService from '../services/dashboard.service';
import Navbar from '../components/Navbar';
import { LayoutContext } from '../contexts/LayoutContext';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line
} from 'recharts';
import { FaChartBar, FaListOl, FaChartLine, FaChartPie } from 'react-icons/fa';
import axios from '../axios';
import { useAuth } from '../auth/AuthContext';
import '../assets/styles/EmployeeDashboard.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartJSTooltip, Legend as ChartJSLegend } from 'chart.js/auto';

ChartJS.register(ArcElement, ChartJSTooltip, ChartJSLegend);

// Composant pour afficher une carte avec un chiffre important
const InfoCard = ({ title, value, icon }) => (
    <div className="infoCard">
        <div className="icon-container">{icon}</div>
        <div className="text-container">
            <h3 className="title">{title}</h3>
            <p className="value">{value}</p>
        </div>
    </div>
);

const ScoreHistoryChart = ({ data }) => {
    const chartData = data?.dates?.map((date, index) => ({
        date: date,
        'Score Moyen': data?.scores?.[index],
    })) || [];

    return (
        <div className="dataCard scoreHistoryChart">
            <h3 className="title">
                <FaChartLine style={{ marginRight: '8px' }} /> Évolution du Score Moyen
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '0.9em', color: '#555' }} />
                    <YAxis style={{ fontSize: '0.9em', color: '#555' }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip labelStyle={{ color: '#333' }} itemStyle={{ color: '#555' }} />
                    <Line type="monotone" dataKey="Score Moyen" stroke="#28a745" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const ProjectPerformanceChart = ({ data }) => {
    const projects = [...new Set(data.map(item => item.projectName))];
    const performancePointsNames = [...new Set(data.map(item => item.performancePointName).filter(name => name))];
    const chartData = projects.map(projectName => {
        const projectData = { name: projectName };
        performancePointsNames.forEach(pointName => {
            const scores = data
                .filter(item => item.projectName === projectName && item.performancePointName === pointName)
                .map(item => item.score);
            projectData[pointName] = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        });
        return projectData;
    });

    const barColors = [
        '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#a678de',
        '#d9534f', '#5cb85c', '#5bc0de', '#f0ad4e', '#428bca', '#5dade2', '#a2d149'
    ];

    return (
        <div className="dataCard projectPerformanceChart">
            <h3 className="title">
                <FaChartBar style={{ marginRight: '8px' }} /> Performance par Projet et Point
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '0.9em', color: '#555' }} />
                    <YAxis style={{ fontSize: '0.9em', color: '#555' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ top: 0, right: 0, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '1.5em' }} />
                    {performancePointsNames.map((pointName, index) => (
                        <Bar
                            key={pointName}
                            dataKey={pointName}
                            name={pointName}
                            fill={barColors[index % barColors.length]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ProjectAverageScorePieChart = ({ data }) => {
    const projectChartData = {
        labels: data.map(score => score.projectName),
        datasets: [
            {
                label: 'Score Moyen par Projet',
                data: data.map(score => score.averageScore),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const projectChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Répartition des Scores Moyens par Projet',
            },
        },
    };

    return (
        <div className="dataCard projectAverageScorePieChart">
            <h3 className="title">
                <FaChartPie style={{ marginRight: '8px' }} /> Scores Moyens par Projet
            </h3>
            <div style={{ width: '100%', height: 300 }}>
                <Pie data={projectChartData} options={projectChartOptions} />
            </div>
        </div>
    );
};

const EmployeeDashboard = () => {
    const [projectScores, setProjectScores] = useState([]);
    const [projectPerformanceData, setProjectPerformanceData] = useState([]);
    const [stats, setStats] = useState(null);
    const [scoreHistory, setScoreHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);
    const { token, loading: authLoading } = useAuth();
    const [totalEvaluations, setTotalEvaluations] = useState(0);
    const [employeeName, setEmployeeName] = useState('');
    const [averageScore, setAverageScore] = useState(0); // Exemple d'une autre info clé

    useEffect(() => {
        const fetchEmployeeInfo = async () => {
            if (token && !authLoading) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get('/users/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setEmployeeId(response.data.userId);
                    setEmployeeName(`${response.data.firstName || ''} ${response.data.lastName || ''}`.trim());
                } catch (err) {
                    setError('Impossible de récupérer les informations de l\'utilisateur.');
                    setLoading(false);
                }
            }
        };
        fetchEmployeeInfo();
    }, [token, authLoading]);

    const [employeeId, setEmployeeId] = useState(null);
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (employeeId) {
                setLoading(true);
                setError(null);
                try {
                    const fullHistoryData = await dashboardService.getEvaluateeFullHistory(employeeId);
                    console.log("Historique complet récupéré :", fullHistoryData);
                    setTotalEvaluations(fullHistoryData?.evaluations?.length || 0);

                    const statsData = await dashboardService.getEvaluateeStats(employeeId);
                    setStats(statsData);
                    setAverageScore(statsData?.averageScore || 0); // Exemple: récupérer le score moyen

                    const historyData = await dashboardService.getEvaluateeScoreHistory(employeeId);
                    setScoreHistory(historyData);

                    const projectScoresData = await dashboardService.getProjectPerformanceScores(employeeId);
                    setProjectPerformanceData(projectScoresData);

                    const averageScoresByProject = projectScoresData.reduce((acc, curr) => {
                        if (!acc[curr.projectName]) {
                            acc[curr.projectName] = { sum: 0, count: 0 };
                        }
                        acc[curr.projectName].sum += curr.score !== null ? curr.score : 0;
                        acc[curr.projectName].count += curr.score !== null ? 1 : 0;
                        return acc;
                    }, {});

                    const projectAverages = Object.keys(averageScoresByProject).map(projectName => ({
                        projectName,
                        averageScore: averageScoresByProject[projectName].count > 0 ? averageScoresByProject[projectName].sum / averageScoresByProject[projectName].count : 0,
                    }));
                    setProjectScores(projectAverages);

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

    if (!stats || !scoreHistory || !projectScores || !projectPerformanceData) {
        return <div>Aucune donnée de tableau de bord disponible.</div>;
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-4">
                    <h1 className="mb-4" style={{ color: '#333' }}>Tableau de Bord de {employeeName}</h1>

                    <div className="row mb-4">
                        <div className="col-md-4">
                            <InfoCard
                                title="Nombre Total d'Évaluations"
                                value={totalEvaluations}
                                icon={<FaListOl size={24} color="#3498db" />}
                            />
                        </div>
                        {stats?.averageScore !== undefined && (
                            <div className="col-md-4">
                                <InfoCard
                                    title="Score Moyen Général"
                                    value={`${averageScore?.toFixed(2)}%`}
                                    icon={<FaChartLine size={24} color="#27ae60" />}
                                />
                            </div>
                        )}
                    </div>

                    <div className="row">
                        {scoreHistory?.dates?.length > 0 && scoreHistory?.scores?.length > 0 && (
                            <div className="col-md-6 mb-4">
                                <ScoreHistoryChart data={scoreHistory} />
                            </div>
                        )}

                        {projectScores.length > 0 && (
                            <div className="col-md-6 mb-4">
                                <ProjectAverageScorePieChart data={projectScores} />
                            </div>
                        )}
                    </div>

                    <div className="row">
                        {projectPerformanceData.length > 0 && (
                            <div className="col-md-12 mb-4">
                                <ProjectPerformanceChart data={projectPerformanceData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import adminDashboardService from '../services/adminDashboardService';
import Navbar from '../components/Navbar';
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js/auto';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function EmployeeHistory() {
    const { id } = useParams();
    const [employeeHistory, setEmployeeHistory] = useState({});
    const [projectScores, setProjectScores] = useState([]);
    const [projectPerformanceScores, setProjectPerformanceScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);
    const [employeeName, setEmployeeName] = useState('');

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const historyData = await adminDashboardService.getEmployeeHistory(id);
                setEmployeeHistory(historyData);

                const name = historyData.evaluations && historyData.evaluations[0] && historyData.evaluations[0].evaluatee
                    ? historyData.evaluations[0].evaluatee.username
                    : 'Unknown Employee';
                setEmployeeName(name);

                const scoresData = await adminDashboardService.getEmployeeProjectPerformanceScores(parseInt(id, 10));
                setProjectPerformanceScores(scoresData);

                // Calculer le score moyen par projet pour le graphique Pie
                const averageScoresByProject = scoresData.reduce((acc, curr) => {
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

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [id]);

    if (loading) {
        return <p>Chargement des données...</p>;
    }

    if (error) {
        return <p>Erreur lors du chargement des données : {error}</p>;
    }

    const performancePoints = employeeHistory.performancePoints || [];
    const evaluations = employeeHistory.evaluations || [];

    const pointTypeScores = performancePoints.reduce((acc, point) => {
        if (!acc[point.pointType.name]) {
            acc[point.pointType.name] = { sum: 0, count: 0 };
        }
        acc[point.pointType.name].sum += point.score;
        acc[point.pointType.name].count++;
        return acc;
    }, {});

    const barChartAverageScoresData = {
        labels: Object.keys(pointTypeScores),
        datasets: [
            {
                label: 'Score Moyen',
                data: Object.values(pointTypeScores).map(item => item.sum / item.count),
                backgroundColor: Object.keys(pointTypeScores).map((_, index) => {
                    const colors = [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(128, 0, 128, 0.8)',
                    ];
                    return colors[index % colors.length];
                }),
            },
        ],
    };

    const barChartAverageScoresOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score Moyen',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Type de Point',
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: 'Score Moyen par Type de Point de Performance',
            },
            legend: {
                display: false,
            },
        },
    };

    const projectChartData = {
        labels: projectScores.map(score => score.projectName),
        datasets: [
            {
                label: 'Score Moyen par Projet',
                data: projectScores.map(score => score.averageScore),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
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
                text: 'Score Moyen par Projet',
            },
        },
    };

    const projects = [...new Set(projectPerformanceScores.map(item => item.projectName))];
    const performancePointsNames = [...new Set(projectPerformanceScores.map(item => item.performancePointName).filter(name => name))];
    const projectPerformanceChartData = {
        labels: projects,
        datasets: performancePointsNames.map(pointName => ({
            label: pointName,
            data: projects.map(projectName => {
                const scores = projectPerformanceScores
                    .filter(item => item.projectName === projectName && item.performancePointName === pointName)
                    .map(item => item.score);
                return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null; 
            }),
            backgroundColor: performancePointsNames.indexOf(pointName) < 7
                ? [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(128, 0, 128, 0.7)',
                ][performancePointsNames.indexOf(pointName)]
                : 'rgba(0, 0, 0, 0.2)',
        })),
    };

    const projectPerformanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score Moyen',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Projet',
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: 'Scores par Point de Performance par Projet',
            },
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <h2>Bilan de l'employé : {employeeName}</h2>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Nombre Total d'Évaluations</h5>
                                    <p className="card-text">{evaluations.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <Bar data={barChartAverageScoresData} options={barChartAverageScoresOptions} height={300} />
                                </div>
                            </div>
                        </div>
                        {projectScores.length > 0 && (
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <Pie data={projectChartData} options={projectChartOptions} height={300} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {projectPerformanceScores.length > 0 && (
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <Bar data={projectPerformanceChartData} options={projectPerformanceChartOptions} height={400} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmployeeHistory;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Alert,
    AlertTitle,
    Box,
    Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js/auto';
import { useAuth } from '../auth/AuthContext';
import { LayoutContext } from '../contexts/LayoutContext';
import { jsPDF } from 'jspdf';
import logoBase64 from '../assets/images/Logo-Proxym.png';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
}));

const chartColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(128, 0, 128, 0.7)',
    'rgba(0, 128, 0, 0.7)',
    'rgba(210, 105, 30, 0.7)',
];

function ManagerProjectDetails() {
    const { projectId } = useParams();
    const { userId: managerId } = useAuth();
    const [teamStats, setTeamStats] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const projectResponse = await axios.get(`http://localhost:3000/projects/${projectId}`);
                setProject(projectResponse.data);
                const teamStatsResponse = await axios.get(
                    `http://localhost:3000/admin/dashboard/projects/${projectId}/team-stats?managerId=${managerId}`
                );
                setTeamStats(teamStatsResponse.data);
            } catch (err) {
                setError(`Erreur lors de la récupération des détails du projet ${projectId}.`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId, managerId]);

    const handleExportPdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const logoWidth = 60;
        const logoHeight = 30;
        const logoX = margin;
        const logoY = margin;
        const lineHeight = 5;
        const availableHeightFirstPage = pageHeight - margin - (logoY + logoHeight + 5) - 20; 

        let yPosition = logoY + logoHeight + 15;

        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);

        doc.setFontSize(10);
        const generationText = `Rapport généré le: ${new Date().toLocaleString()}`;
        const generationTextWidth = doc.getTextWidth(generationText);
        const generationX = pageWidth - margin - generationTextWidth;
        doc.text(generationText, generationX, margin + 5);

        doc.setFontSize(22);
        const titleText = `Rapport de Projet: ${project?.project_name || '-'}`;
        const titleX = (pageWidth - doc.getTextWidth(titleText)) / 2;
        doc.text(titleText, titleX, yPosition);
        yPosition += 12;

        doc.setFontSize(14);
        doc.text('Informations Générales:', margin, yPosition);
        yPosition += 8;
        doc.setFontSize(12);
        doc.text(`Nom du Projet: ${project?.project_name || '-'}`, margin + 10, yPosition);
        yPosition += 5;
        doc.text(`Description: ${project?.description || '-'}`, margin + 10, yPosition);
        yPosition += 5;
        doc.text(`Statut: ${project?.status || '-'}`, margin + 10, yPosition);
        yPosition += 5;
        doc.text(`Priorité: ${project?.priority || '-'}`, margin + 10, yPosition);
        yPosition += 5;
        doc.text(`Date de Début: ${project?.start_date?.slice(0, 10) || '-'}`, margin + 10, yPosition);
        yPosition += 5;
        doc.text(`Date de Fin: ${project?.end_date?.slice(0, 10) || '-'}`, margin + 10, yPosition);
        yPosition += 10;

        doc.setFontSize(14);
        doc.text('Score Moyen Global par Employé:', margin, yPosition);
        yPosition += 8;
        doc.setFontSize(12);
        if (teamStats.length > 0) {
            teamStats.forEach(employee => {
                doc.text(`${employee.username}: ${employee.averageScore !== null ? employee.averageScore.toFixed(2) : '-'}`, margin + 10, yPosition);
                yPosition += 5;
            });
        } else {
            doc.text('Aucune donnée de performance globale disponible.', margin + 10, yPosition);
            yPosition += 5;
        }
        yPosition += 10;

        doc.setFontSize(14);
        if (yPosition + 15 > availableHeightFirstPage) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text('Score Moyen par Point de Performance et par Employé:', margin, yPosition);
        yPosition += 8;
        doc.setFontSize(12);
        if (teamStats.length > 0) {
            teamStats.forEach(employee => {
                doc.text(`${employee.username}:`, margin + 10, yPosition);
                yPosition += 5;
                const performancePoints = employee.averageScoresByPerformancePoint || {};
                if (Object.keys(performancePoints).length > 0) {
                    Object.entries(performancePoints).forEach(([pointName, score]) => {
                        const truncatedPointName = pointName.length > 20 ? pointName.substring(0, 20) + '...' : pointName;
                        const textToAdd = `  - ${truncatedPointName}: ${score?.toFixed(2) || '-'}`;
                        const textHeight = doc.getTextDimensions(textToAdd).h;
                        if (yPosition + textHeight + 2 > pageHeight - margin) {
                            doc.addPage();
                            yPosition = margin;
                            doc.text(`${employee.username}:`, margin + 10, yPosition);
                            yPosition += 5;
                        }
                        doc.text(textToAdd, margin + 20, yPosition);
                        yPosition += lineHeight;
                    });
                } else {
                    const textToAdd = '  Aucun point de performance évalué pour cet employé.';
                    const textHeight = doc.getTextDimensions(textToAdd).h;
                    if (yPosition + textHeight + 2 > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                        doc.text(`${employee.username}:`, margin + 10, yPosition);
                        yPosition += 5;
                    }
                    doc.text(textToAdd, margin + 20, yPosition);
                    yPosition += lineHeight;
                }
                yPosition += 8;
                if (yPosition > pageHeight - margin - 10 && teamStats.indexOf(employee) < teamStats.length - 1) {
                    doc.addPage();
                    yPosition = margin;
                }
            });
        } else {
            doc.text('Aucune donnée de performance par point disponible.', margin + 10, yPosition);
            yPosition += 5;
        }

        doc.save(`rapport_projet_${project?.project_name || 'rapport_projet'}.pdf`);
    };

    const barChartTeamScoresData = {
        labels: teamStats.map(employee => employee.username),
        datasets: [
            {
                label: 'Score Moyen Global',
                data: teamStats.map(employee => employee.averageScore !== null ? employee.averageScore.toFixed(2) : 0),
                backgroundColor: chartColors[1],
            },
        ],
    };

    const barChartTeamScoresOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score Moyen Global',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Employé',
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: `Score Moyen Global des Employés pour ${project?.project_name || 'Projet'}`,
            },
            legend: {
                display: false,
            },
        },
    };

    const performancePointChartData = {
        labels: teamStats.map(employee => employee.username),
        datasets: Object.keys(teamStats[0]?.averageScoresByPerformancePoint || {}).map((pointName, index) => ({
            label: pointName,
            data: teamStats.map(employee => employee.averageScoresByPerformancePoint?.[pointName]?.toFixed(2) || 0),
            backgroundColor: chartColors[index % chartColors.length],
        })),
    };

    const performancePointChartOptions = {
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
                    text: 'Employé',
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: `Scores Moyens par Point de Performance pour ${project?.project_name || 'Projet'}`,
            },
        },
    };

    const chartContainerStyle = {
        height: '400px',
    };

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid mt-4">
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
                            <CircularProgress size={60} />
                            <Typography variant="body1" color="textSecondary" mt={2}>Chargement des détails du projet...</Typography>
                        </Box>
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
                    <div className="container-fluid mt-4">
                        <Alert severity="error" className="shadow-sm">
                            <AlertTitle>Erreur</AlertTitle>
                            <Typography>{error}</Typography>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid mt-4">
                        <Typography variant="h6" style={{ textAlign: 'center' }}>Projet non trouvé.</Typography>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <Typography variant="h4" gutterBottom style={{ color: '#333' }}>
                        Détails du Projet: {project.project_name}
                    </Typography>
                    <Typography variant="subtitle1" className="mb-3 text-secondary">
                        Visualisation des performances de l'équipe.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <StyledPaper>
                                <Typography variant="h6" className="mb-3">Score Moyen Global par Employé</Typography>
                                <div style={chartContainerStyle}>
                                    <Bar data={barChartTeamScoresData} options={barChartTeamScoresOptions} />
                                </div>
                            </StyledPaper>
                        </Grid>

                        {Object.keys(teamStats[0]?.averageScoresByPerformancePoint || {}).length > 0 && (
                            <Grid item xs={12} md={8}>
                                <StyledPaper>
                                    <Typography variant="h6" className="mb-3">Score Moyen par Point de Performance et par Employé</Typography>
                                    <div style={chartContainerStyle}>
                                        <Bar data={performancePointChartData} options={performancePointChartOptions} />
                                    </div>
                                </StyledPaper>
                            </Grid>
                        )}
                    </Grid>

                    <Box mt={3}>
                        <Button
                            onClick={handleExportPdf}
                            variant="contained"
                            color="secondary"
                            size="large"
                            style={{ marginRight: '20px' }}
                        >
                            Exporter en PDF
                        </Button>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outlined"
                            color="primary"
                            size="large"
                        >
                            Retour au Tableau de Bord
                        </Button>
                    </Box>
                </div>
            </div>
        </div>
    );
}

export default ManagerProjectDetails;
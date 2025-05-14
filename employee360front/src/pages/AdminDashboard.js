import React, { useState, useEffect, useContext } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { blueGrey, green, red, amber, grey } from '@mui/material/colors';
import { LayoutContext } from '../contexts/LayoutContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Rocket, Activity, Users, CheckCircle, TrendingUp, LayoutDashboard, PercentCircle, Clock } from 'lucide-react';
import adminDashboardService from '../services/adminDashboardService';

const primary = blueGrey[700];
const secondary = blueGrey[500];
const success = green[500];
const warning = amber[700];
const error = red[500];
const muted = blueGrey[300];
const info = blueGrey[300];
const dark = grey[800];

const COLORS_BAR = [
  'rgba(255, 99, 132, 0.8)',
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(128, 0, 128, 0.8)',
  'rgba(0, 128, 0, 0.8)', // Ajoute d'autres couleurs uniques
  'rgba(255, 0, 0, 0.8)',
  // Tu peux ajouter d'autres couleurs ici
];const COLORS_LINE = [primary, success, warning, error, secondary, muted, info, dark];
const COLORS_PIE = [success, muted, warning, error, info];

const chartStyle = {
    fontSize: '0.9em',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    color: grey[700],
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    hover: { scale: 1.03, boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)' },
};

const KeyIndicatorCard = ({ title, value, color = primary, icon: Icon }) => {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <Card
                elevation={4}
                sx={{
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    alignItems: 'flex-start'
                }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" style={{ color, fontWeight: 600 }}>
                        {value}
                    </Typography>
                    {Icon && (
                        <Icon
                            sx={{
                                fontSize: 48,
                                color,
                                mt: 2,
                                alignSelf: 'flex-end'
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ChartCard = ({ title, children }) => {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            <Card elevation={4} sx={{ transition: 'all 0.3s ease' }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                            marginBottom: 3,
                            fontWeight: 600,
                            color: dark
                        }}
                    >
                        {title}
                    </Typography>
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    );
};

function AdminDashboard() {
    const [totalEmployees, setTotalEmployees] = useState(null);
    const [totalPerformancePointTypes, setTotalPerformancePointTypes] = useState(null);
    const [totalEvaluations, setTotalEvaluations] = useState(null);
    const [evaluationsCurrentPeriod, setEvaluationsCurrentPeriod] = useState(null);
    const [averageOverallScoreCurrentPeriod, setAverageOverallScoreCurrentPeriod] = useState(null);
    const [averageScoresByPerformancePoint, setAverageScoresByPerformancePoint] = useState(null);
    const [employeesWithoutEvaluation, setEmployeesWithoutEvaluation] = useState(null);
    const [averageOverallScoreTrend, setAverageOverallScoreTrend] = useState(null);
    const [evaluationsTrend, setEvaluationsTrend] = useState(null);
    const [employeeScoreDistribution, setEmployeeScoreDistribution] = useState(null);
    const [performancePointScoreTrend, setPerformancePointScoreTrend] = useState(null);
    const [evaluationsInProgress, setEvaluationsInProgress] = useState(null);
    const [performancePointParticipationRate, setPerformancePointParticipationRate] = useState(null);
    const [evaluationCompletionRate, setEvaluationCompletionRate] = useState(null);
    const [evaluationsLate, setEvaluationsLate] = useState(null);
    const [averageCompletionTime, setAverageCompletionTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const employees = await adminDashboardService.getTotalEmployees();
                setTotalEmployees(employees);
                const pointTypes = await adminDashboardService.getTotalPerformancePointTypes();
                setTotalPerformancePointTypes(pointTypes);
                const evaluationsTotal = await adminDashboardService.getTotalEvaluations();
                setTotalEvaluations(evaluationsTotal);
                const evaluationsCurrent = await adminDashboardService.getEvaluationsCurrentPeriod();
                setEvaluationsCurrentPeriod(evaluationsCurrent);
                const overallScore = await adminDashboardService.getAverageOverallScoreCurrentPeriod();
                setAverageOverallScoreCurrentPeriod(overallScore);
                const scoresByPoint = await adminDashboardService.getAverageScoresByPerformancePointCurrentPeriod();
                setAverageScoresByPerformancePoint(scoresByPoint);
                const withoutEval = await adminDashboardService.getEmployeesWithoutEvaluationCurrentPeriod();
                setEmployeesWithoutEvaluation(withoutEval);
                const scoreTrend = await adminDashboardService.getAverageOverallScoreTrend();
                setAverageOverallScoreTrend(scoreTrend);
                const evalTrend = await adminDashboardService.getEvaluationsTrend();
                setEvaluationsTrend(evalTrend);
                const scoreDist = await adminDashboardService.getEmployeeScoreDistributionCurrentPeriod();
                setEmployeeScoreDistribution(scoreDist);
                const pointScoreTrend = await adminDashboardService.getPerformancePointScoreTrend();
                setPerformancePointScoreTrend(pointScoreTrend);
                const inProgress = await adminDashboardService.getEvaluationsInProgress();
                setEvaluationsInProgress(inProgress);
                const participationRate = await adminDashboardService.getPerformancePointParticipationRate();
                setPerformancePointParticipationRate(participationRate);
                const completionRate = await adminDashboardService.getEvaluationCompletionRateCurrentPeriod();
                setEvaluationCompletionRate(completionRate);
                const lateEvaluations = await adminDashboardService.getEvaluationsLateCurrentPeriod();
                setEvaluationsLate(lateEvaluations);
                const completionTime = await adminDashboardService.getAverageCompletionTimeCurrentPeriod();
                setAverageCompletionTime(completionTime);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div style={{ padding: 20 }}>
                        <Typography variant="h4" gutterBottom>Tableau de Bord Admin</Typography>
                        <CircularProgress />
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
                    <div style={{ padding: 20 }}>
                        <Typography variant="h4" gutterBottom>Tableau de Bord Admin</Typography>
                        <Alert severity="error">{`Erreur lors du chargement des données: ${error}`}</Alert>
                    </div>
                </div>
            </div>
        );
    }

    const averageScoreByTypeData = performancePointScoreTrend
        ? performancePointScoreTrend.map((item) => {
            const totalScore = item.trend.reduce((sum, t) => sum + t.averageScore, 0);
            const averageScore = item.trend.length > 0 ? totalScore / item.trend.length : 0;
            return {
                pointTypeName: item.pointTypeName,
                averageScore: averageScore,
            };
        })
        : [];

    const completionRateData = [
        { name: 'Complétées', value: evaluationCompletionRate || 0 },
        { name: 'En cours/Non complétées', value: 100 - (evaluationCompletionRate || 0) },
    ];

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div style={{ padding: 20 }}>
                    <Typography variant="h4" gutterBottom sx={{
                        color: dark,
                        fontWeight: 600
                    }}>Tableau de Bord Admin</Typography>

                    {/* Section des indicateurs clés améliorée */}
                    <Grid container spacing={4} mb={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <KeyIndicatorCard
                                title="Total Employés"
                                value={totalEmployees}
                                color={primary}
                                icon={Users}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KeyIndicatorCard
                                title="Total Types de Points"
                                value={totalPerformancePointTypes}
                                color={secondary}
                                icon={Activity}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KeyIndicatorCard
                                title="Total Évaluations"
                                value={totalEvaluations}
                                color={primary}
                                icon={CheckCircle}
                            />
                        </Grid>
                        
                    </Grid>

                    {/* Section des graphiques améliorée (ordonnée par importance) */}
                    <Grid container spacing={4}>
                        {/* Tendance du Score Moyen Global (Graphique de ligne - Important) */}
                        {averageOverallScoreTrend && averageOverallScoreTrend.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Tendance du Score Moyen Global">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={averageOverallScoreTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="period"
                                                style={chartStyle}
                                                tickLine={false} // Remove axis ticks
                                                axisLine={false}
                                            />
                                            <YAxis
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(248, 62, 84, 0.15)',
                                                    padding: '15px',
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#333', fontSize: '1.1em' }}
                                                itemStyle={{ color: '#555', fontSize: '1em' }}
                                                animationDuration={200}
                                            />
                                            <Legend
                                                wrapperStyle={{ ...chartStyle, marginTop: 20 }}
                                                formatter={(value) => <span style={{ color: grey[700], fontSize: '1em' }}>{value}</span>}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="averageScore"
                                                stroke={COLORS_LINE[0]}
                                                strokeWidth={4}
                                                dot={{
                                                    r: 8,
                                                    stroke: COLORS_LINE[0],
                                                    strokeWidth: 3,
                                                    fill: '#fff',
                                                }}
                                                activeDot={{
                                                    r: 12,
                                                    stroke: COLORS_LINE[0],
                                                    strokeWidth: 3,
                                                    fill: '#fff',
                                                }}
                                                name="Score Moyen"
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    animation: 'line-chart-animation 2s ease-in-out',
                                                }}
                                                isAnimationActive={true}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        )}

                        {/* Tendance des Évaluations (Graphique à barres - Important) */}
                        {evaluationsTrend && evaluationsTrend.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Tendance des Évaluations">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={evaluationsTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="period"
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    padding: '15px',
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#333', fontSize: '1.1em' }}
                                                itemStyle={{ color: '#555', fontSize: '1em' }}
                                                animationDuration={200}
                                            />
                                            <Legend
                                                wrapperStyle={{ ...chartStyle, marginTop: 20 }}
                                                formatter={(value) => <span style={{ color: grey[700], fontSize: '1em' }}>{value}</span>}
                                            />
                                            <Bar
                                                dataKey="numberOfEvaluations"
                                                fill={COLORS_BAR[1]}
                                                name="Nombre d'Évaluations"
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    animation: 'bar-chart-animation 1s ease',
                                                }}
                                                isAnimationActive={true}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        )}

                        {/* Scores Moyens par Type de Point (Période Actuelle) (Graphique à barres) */}
                        {averageScoresByPerformancePoint && Object.keys(averageScoresByPerformancePoint).length > 0 && (
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Scores Moyens par Type de Point (Période Actuelle)">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={Object.entries(averageScoresByPerformancePoint).map(([name, score]) => ({ name, score }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    padding: '15px',
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#333', fontSize: '1.1em' }}
                                                itemStyle={{ color: '#555', fontSize: '1em' }}
                                                animationDuration={200}
                                            />
                                            <Bar
                                                dataKey="score"
                                                fill={COLORS_BAR[2]}
                                                name="Score Moyen"
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    animation: 'bar-chart-animation 1s ease',
                                                }}
                                                isAnimationActive={true}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        )}

                        {/* Distribution des Scores des Employés (Période Actuelle) (Graphique à barres) */}
                        {employeeScoreDistribution && employeeScoreDistribution.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Distribution des Scores des Employés (Période Actuelle)">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={employeeScoreDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="range"
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    padding: '15px',
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#333', fontSize: '1.1em' }}
                                                itemStyle={{ color: '#555', fontSize: '1em' }}
                                                animationDuration={200}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill={COLORS_BAR[0]}
                                                name="Nombre d'Employés"
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    animation: 'bar-chart-animation 1s ease',
                                                }}
                                                isAnimationActive={true}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        )}

                        {/* Score Moyen par Type de Point (Toutes Périodes) (Graphique à barres) */}
                        {performancePointScoreTrend && performancePointScoreTrend.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Score Moyen par Type de Point (Toutes Périodes)">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={averageScoreByTypeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="pointTypeName"
                                                style={{ ...chartStyle, fontSize: '0.8em' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                style={chartStyle}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    padding: '15px',
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#333', fontSize: '1em' }}
                                                itemStyle={{ color: '#555', fontSize: '0.9em' }}
                                                animationDuration={200}
                                            />
                                            <Bar
                                                dataKey="averageScore"
                                                fill={(entry, index) => COLORS_BAR[index % COLORS_BAR.length]}
                                                name="Score Moyen"
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    animation: 'bar-chart-animation 1s ease',
                                                }}
                                                isAnimationActive={true}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

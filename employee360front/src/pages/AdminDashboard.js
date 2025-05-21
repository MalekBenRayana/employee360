import React, { useState, useEffect, useContext } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Box,
    useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { LayoutContext } from '../contexts/LayoutContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Rocket, Activity, Users, CheckCircle, TrendingUp, LayoutDashboard, PercentCircle, Clock } from 'lucide-react';
import adminDashboardService from '../services/adminDashboardService';

// Define a more cohesive and accessible color palette with user-specified colors
const palette = {
    primary: '#68b3e8', // Bleu clair
    secondary: '#9e70cf', // Violet/Magenta
    success: '#00a651', // Vert
    warning: '#f7941d', // Orange
    error: '#f26c4f', // Rouge/Orange vif
    info: '#a7d35d', // Vert clair/Lime
    dark: '#333333', // Dark text for contrast
    text: '#555555', // General text color
    background: '#f8f8f8', // Light background for cards and main content
    chartAccent1: '#68b3e8', // Bleu clair
    chartAccent2: '#9e70cf', // Violet/Magenta
    chartAccent3: '#f7941d', // Orange
    chartAccent4: '#f26c4f', // Rouge/Orange vif
    chartAccent5: '#ed1c6b', // Rose vif/Fuchsia
    chartAccent6: '#fff200', // Jaune
    chartAccent7: '#a7d35d', // Vert clair/Lime
    chartAccent8: '#00a651', // Vert
};

const COLORS_BAR = [
    palette.chartAccent1,
    palette.chartAccent2,
    palette.chartAccent3,
    palette.chartAccent4,
    palette.chartAccent5,
    palette.chartAccent6,
    palette.chartAccent7,
    palette.chartAccent8,
];

const COLORS_LINE = [
    palette.chartAccent1,
    palette.chartAccent2,
    palette.chartAccent3,
    palette.chartAccent4,
    palette.chartAccent5,
];

const COLORS_PIE = [
    palette.success,
    palette.info,
    palette.warning,
    palette.error,
    palette.primary,
];

const chartTextStyle = {
    fontSize: '0.85em',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    color: palette.text,
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    hover: { scale: 1.02, boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)' },
};

const KeyIndicatorCard = ({ title, value, color, icon: Icon }) => {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <Card
                elevation={6}
                sx={{
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${color} 30%, ${color}DD 90%)`,
                    color: '#fff',
                }}
            >
                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    alignItems: 'flex-start',
                    p: 3,
                }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                        {value}
                    </Typography>
                    {Icon && (
                        <Icon
                            sx={{
                                fontSize: 60,
                                color: 'rgba(255,255,255,0.7)',
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
            style={{ height: '100%' }}
        >
            <Card elevation={6} sx={{
                transition: 'all 0.3s ease',
                height: '100%',
                borderRadius: '12px',
                background: palette.background,
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                            marginBottom: 3,
                            fontWeight: 600,
                            color: palette.dark,
                            borderBottom: `1px solid #e0e0e0`, // Subtle separator
                            pb: 1.5,
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
    const theme = useTheme();

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

    // Data transformation for 'Score Moyen par Type de Point (Toutes Périodes)'
    const averageScoreByTypeData = performancePointScoreTrend
        ? performancePointScoreTrend.map((item) => {
            const totalScore = item.trend.reduce((sum, t) => sum + t.averageScore, 0);
            const averageScore = item.trend.length > 0 ? parseFloat((totalScore / item.trend.length).toFixed(2)) : 0; // Format to 2 decimal places
            return {
                pointTypeName: item.pointTypeName,
                averageScore: averageScore,
            };
        })
        : [];

    // Data for Evaluation Completion Rate Pie Chart
    const completionRateData = [
        { name: 'Complétées', value: evaluationCompletionRate || 0 },
        { name: 'En cours/Non complétées', value: 100 - (evaluationCompletionRate || 0) },
    ].filter(item => item.value > 0); // Only show slices with values

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <Box
                    className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 'calc(100vh - 64px)',
                        bgcolor: palette.background,
                    }}
                >
                    <CircularProgress sx={{ color: palette.primary }} size={60} />
                </Box>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-layout">
                <Navbar />
                <Box
                    className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}
                    sx={{ p: 4, bgcolor: palette.background }}
                >
                    <Typography variant="h4" gutterBottom sx={{ color: palette.dark, fontWeight: 600 }}>Tableau de Bord Admin</Typography>
                    <Alert severity="error" sx={{ mt: 3, borderRadius: '8px' }}>{`Erreur lors du chargement des données: ${error}`}</Alert>
                </Box>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <Box
                className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}
                sx={{ p: 4, bgcolor: palette.background, minHeight: '100vh' }}
            >
                <Typography variant="h4" gutterBottom sx={{
                    color: palette.dark,
                    fontWeight: 700,
                    mb: 4,
                    borderBottom: `2px solid ${palette.primary}`,
                    pb: 1,
                }}>Tableau de Bord Admin</Typography>

                <Grid container spacing={4} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <KeyIndicatorCard
                            title="Total Employés"
                            value={totalEmployees}
                            color={palette.primary}
                            icon={Users}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KeyIndicatorCard
                            title="Total Types de Points"
                            value={totalPerformancePointTypes}
                            color={palette.secondary}
                            icon={Activity}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KeyIndicatorCard
                            title="Total Évaluations"
                            value={totalEvaluations}
                            color={palette.success}
                            icon={CheckCircle}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    {/* Tendance du Score Moyen Global (Line Chart) */}
                    {averageOverallScoreTrend && averageOverallScoreTrend.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <ChartCard title="Tendance du Score Moyen Global">
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={averageOverallScoreTrend}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <XAxis
                                            dataKey="period"
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            padding={{ left: 20, right: 20 }}
                                        />
                                        <YAxis
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid #cccccc`,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ fontWeight: 'bold', color: palette.dark, fontSize: '1em' }}
                                            itemStyle={{ color: palette.text, fontSize: '0.9em' }}
                                            formatter={(value) => [`${value.toFixed(2)}`, 'Score Moyen']}
                                        />
                                        <Legend
                                            wrapperStyle={{ ...chartTextStyle, marginTop: 20, textAlign: 'center' }}
                                            formatter={(value) => <span style={{ color: palette.text, fontSize: '0.9em' }}>{value}</span>}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="averageScore"
                                            stroke={COLORS_LINE[0]}
                                            strokeWidth={3}
                                            dot={{
                                                r: 5,
                                                stroke: COLORS_LINE[0],
                                                strokeWidth: 2,
                                                fill: '#fff',
                                            }}
                                            activeDot={{
                                                r: 8,
                                                stroke: COLORS_LINE[0],
                                                strokeWidth: 3,
                                                fill: '#fff',
                                            }}
                                            name="Score Moyen"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </Grid>
                    )}

                    {/* Scores Moyens par Type de Point (Période Actuelle) (Bar Chart) */}
                    {averageScoresByPerformancePoint && Object.keys(averageScoresByPerformancePoint).length > 0 && (
                        <Grid item xs={12} md={6}>
                            <ChartCard title="Scores Moyens par Type de Point (Période Actuelle)">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={Object.entries(averageScoresByPerformancePoint).map(([name, score]) => ({ name, score: parseFloat(score.toFixed(2)) }))}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <XAxis
                                            dataKey="name"
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            interval={0}
                                            angle={-30}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid #cccccc`,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ fontWeight: 'bold', color: palette.dark, fontSize: '1em' }}
                                            itemStyle={{ color: palette.text, fontSize: '0.9em' }}
                                            formatter={(value) => [`${value.toFixed(2)}`, 'Score Moyen']}
                                        />
                                        <Bar
                                            dataKey="score"
                                            fill={COLORS_BAR[0]}
                                            name="Score Moyen"
                                            isAnimationActive={true}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </Grid>
                    )}

                    {/* Distribution des Scores des Employés (Période Actuelle) (Bar Chart) */}
                    {employeeScoreDistribution && employeeScoreDistribution.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <ChartCard title="Distribution des Scores des Employés (Période Actuelle)">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={employeeScoreDistribution}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <XAxis
                                            dataKey="range"
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                        />
                                        <YAxis
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid #cccccc`,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ fontWeight: 'bold', color: palette.dark, fontSize: '1em' }}
                                            itemStyle={{ color: palette.text, fontSize: '0.9em' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill={COLORS_BAR[1]}
                                            name="Nombre d'Employés"
                                            isAnimationActive={true}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </Grid>
                    )}

                    {/* Score Moyen par Type de Point (Toutes Périodes) (Bar Chart) */}
                    {averageScoreByTypeData && averageScoreByTypeData.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <ChartCard title="Score Moyen par Type de Point (Toutes Périodes)">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={averageScoreByTypeData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <XAxis
                                            dataKey="pointTypeName"
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            interval={0}
                                            angle={-30}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            style={chartTextStyle}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cccccc' }}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid #cccccc`,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ fontWeight: 'bold', color: palette.dark, fontSize: '1em' }}
                                            itemStyle={{ color: palette.text, fontSize: '0.9em' }}
                                            formatter={(value) => [`${value.toFixed(2)}`, 'Score Moyen']}
                                        />
                                        <Bar
                                            dataKey="averageScore"
                                            fill={(entry, index) => COLORS_BAR[index % COLORS_BAR.length]}
                                            name="Score Moyen"
                                            isAnimationActive={true}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </div>
    );
}

export default AdminDashboard;

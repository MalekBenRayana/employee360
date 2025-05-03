import { useState, useEffect } from 'react';

interface DashboardData {
  totalEmployees: number;
  totalPerformancePointTypes: number;
  totalEvaluations: number;
  averageOverallScoreCurrentPeriod: number;
  averageScoresByPerformancePointCurrentPeriod: { [key: string]: number };
  evaluationsCurrentPeriod: number;
  employeesWithoutEvaluationCurrentPeriod: number;
  averageOverallScoreTrend: { period: string; averageScore: number }[];
  evaluationsTrend: { period: string; numberOfEvaluations: number }[];
  employeeScoreDistributionCurrentPeriod: { range: string; count: number }[];
  topNPerformingEmployeesCurrentPeriod: { employeeId: number; averageScore: number; username: string }[];
  bottomNPerformingEmployeesCurrentPeriod: { employeeId: number; averageScore: number; username: string }[];
  performancePointScoreTrend: {
    pointTypeName: string;
    trend: { period: string; averageScore: number }[];
  }[];
  evaluationsInProgress: number;
  performancePointParticipationRate: { pointTypeName: string; participationRate: number }[];
}

const useAdminDashboardService = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = 'http://localhost:3000/admin/dashboard';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { dashboardData, loading, error };
};

export default useAdminDashboardService;

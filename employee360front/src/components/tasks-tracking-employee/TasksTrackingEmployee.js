import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import taskEstimationsService from '../../services/taskEstimationsService';
import { useAuth } from '../../auth/AuthContext';

const TasksTrackingEmployee = () => {
  const { collapsed } = useContext(LayoutContext);
  const { userId: loggedInUserId, authLoading } = useAuth();
  const [taskEstimations, setTaskEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [totalRealizedTime, setTotalRealizedTime] = useState(0);

  useEffect(() => {
    const fetchMyTaskEstimations = async () => {
      if (!authLoading && loggedInUserId) {
        setLoading(true);
        setError(null);
        console.log("Fetching task estimations for user ID:", loggedInUserId);

        try {
          const estimations = await taskEstimationsService.getTaskEstimationsByUserId(loggedInUserId);
          setTaskEstimations(estimations);
          console.log("Task estimation data received:", estimations);
          setLoading(false);
        } catch (err) {
          setError('Erreur lors de la récupération de vos estimations de tâches.');
          console.error(err);
          setLoading(false);
        }
      } else if (authLoading) {
        console.log("Authentification en cours de chargement, attendez avant de récupérer les estimations de tâches.");
      } else {
        console.log("loggedInUserId est undefined ou authLoading est false, skipping fetch.");
      }
    };

    fetchMyTaskEstimations();
  }, [loggedInUserId, authLoading]);

  useEffect(() => {
    const totalEstimated = taskEstimations.reduce((sum, item) => sum + (item.totalEstimatedTime || 0), 0);
    const totalRealized = taskEstimations.reduce((sum, item) => sum + (item.totalRealizedTime || 0), 0);
    setTotalEstimatedTime(totalEstimated);
    setTotalRealizedTime(totalRealized);
  }, [taskEstimations]);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement de vos estimations de tâches...</p>
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
            <p className="text-danger">{error}</p>
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
          <h1>Mes Estimations de Tâches</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card card-summary">
                <div className="card-body">
                  <h5 className="card-title">Temps Estimé Total (min)</h5>
                  <p className="card-text">{totalEstimatedTime}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-summary">
                <div className="card-body">
                  <h5 className="card-title">Temps Réalisé Total (min)</h5>
                  <p className="card-text">{totalRealizedTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Détails de Mes Estimations de Tâches</h5>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Temps Estimé Total (min)</th>
                      <th>Temps Réalisé Total (min)</th>
                      <th>Violations d'Échéance</th>
                      <th>Période de Violation Totale (jours)</th>
                      <th>Début de Période</th>
                      <th>Fin de Période</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskEstimations.map(estimation => (
                      <tr key={estimation.id}>
                        <td>{estimation.totalEstimatedTime}</td>
                        <td>{estimation.totalRealizedTime}</td>
                        <td>{estimation.numberOfDueDateViolations}</td>
                        <td>{estimation.totalViolationPeriod}</td>
                        <td>{estimation.periodStart}</td>
                        <td>{estimation.periodEnd}</td>
                      </tr>
                    ))}
                    {taskEstimations.length === 0 && <tr><td colSpan="7">Aucune estimation de tâche trouvée.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTrackingEmployee;
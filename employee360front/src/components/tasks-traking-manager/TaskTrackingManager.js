import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import timeTrackingService from '../../services/timeTrackingService';
import { useAuth } from '../../auth/AuthContext';

const TaskTrackingManager = () => {
  const { collapsed } = useContext(LayoutContext);
  const [taskEstimationsData, setTaskEstimationsData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [totalRealizedTime, setTotalRealizedTime] = useState(0);

  const { userId, role, authLoading } = useAuth();
  const managerId = userId;

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        return;
      }

      if (!managerId) {
        setLoading(false);
        setError("L'ID du manager n'est pas disponible après le chargement de l'authentification.");
        return;
      }
      
      if (role !== 'manager') {
          setLoading(false);
          setError("Accès non autorisé. Vous n'avez pas le rôle de manager.");
          return;
      }

      setLoading(true);
      setError(null);
      try {
        const teamStats = await timeTrackingService.getTeamStats(managerId);

        const mappedEstimations = teamStats.flatMap(employee =>
          employee.taskEstimationDetails ? employee.taskEstimationDetails.map(estimation => ({
            id: estimation.id,
            user: {
              id: employee.employeeId,
              username: employee.username,
            },
            totalEstimatedTime: estimation.totalEstimatedTime,
            totalRealizedTime: estimation.totalRealizedTime,
            numberOfDueDateViolations: estimation.numberOfDueDateViolations,
            totalViolationPeriod: estimation.totalViolationPeriod,
            periodStart: estimation.periodStart,
            periodEnd: estimation.periodEnd,
          })) : []
        );

        const uniqueEmployees = Array.from(new Map(teamStats.map(employee => [employee.employeeId, { id: employee.employeeId, username: employee.username }])).values());

        const employeeOptions = [{ id: 'all', username: 'Tous les employés' }];
        employeeOptions.push(...uniqueEmployees);

        setEmployeeList(employeeOptions);
        setTaskEstimationsData(mappedEstimations);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données des estimations de tâches.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [managerId, role, authLoading]);

  const filteredData = useMemo(() => {
    let currentData = taskEstimationsData;

    if (searchUsername.trim() && searchResults.length > 0) {
      const searchedEmployeeIds = new Set(searchResults.map(res => res.user.id));
      currentData = currentData.filter(item => searchedEmployeeIds.has(item.user.id));
    }

    if (selectedEmployeeId !== 'all') {
      currentData = currentData.filter(item => item.user.id === parseInt(selectedEmployeeId));
    }

    return currentData;
  }, [taskEstimationsData, selectedEmployeeId, searchUsername, searchResults]);


  useEffect(() => {
    const totalEstimated = filteredData.reduce((sum, item) => sum + item.totalEstimatedTime, 0);
    const totalRealized = filteredData.reduce((sum, item) => sum + item.totalRealizedTime, 0);
    setTotalEstimatedTime(totalEstimated);
    setTotalRealizedTime(totalRealized);
  }, [filteredData]);

  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
    setSearchResults([]);
    setSearchUsername('');
  };

  const handleSearchUsernameChange = async (event) => {
    const username = event.target.value;
    setSearchUsername(username);
    setSelectedEmployeeId('all');

    if (username.trim()) {
      setLoading(true);
      setError(null);
      try {
        const allTeamStats = await timeTrackingService.getTeamStats(managerId);

        const filteredTeamStats = allTeamStats.filter(employee =>
          employee.username.toLowerCase().includes(username.toLowerCase())
        );

        const searchData = filteredTeamStats.flatMap(employee =>
          employee.taskEstimationDetails ? employee.taskEstimationDetails.map(estimation => ({
            id: estimation.id,
            user: {
              id: employee.employeeId,
              username: employee.username,
            },
            totalEstimatedTime: estimation.totalEstimatedTime,
            totalRealizedTime: estimation.totalRealizedTime,
            numberOfDueDateViolations: estimation.numberOfDueDateViolations,
            totalViolationPeriod: estimation.totalViolationPeriod,
            periodStart: estimation.periodStart,
            periodEnd: estimation.periodEnd,
          })) : []
        );
        setSearchResults(searchData);
        setLoading(false);
      } catch (err) {
        setError(`Erreur lors de la recherche des estimations pour "${username}".`);
        console.error(err);
        setLoading(false);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchUsername('');
    setSearchResults([]);
  };

  if (authLoading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Vérification de l'authentification...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId || role !== 'manager') {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p className="text-danger">Accès non autorisé. Vous devez être connecté en tant que manager pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement des données de suivi des tâches...</p>
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
          <h1>Suivi des Tâches de l'Équipe</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Temps Estimé Total de l'Équipe (min)</h5>
                  <p className="card-text">{totalEstimatedTime}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Temps Réalisé Total de l'Équipe (min)</h5>
                  <p className="card-text">{totalRealizedTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filtrer et Rechercher les Employés</h5>
              <div className="mb-3">
                <label htmlFor="employeeFilter" className="form-label">Filtrer par employé :</label>
                <select
                  className="form-select"
                  id="employeeFilter"
                  value={selectedEmployeeId}
                  onChange={handleEmployeeChange}
                >
                  {employeeList.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.username}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label htmlFor="searchUsername" className="form-label">Rechercher par nom d'utilisateur :</label>
                <input
                  type="text"
                  className="form-control"
                  id="searchUsername"
                  value={searchUsername}
                  onChange={handleSearchUsernameChange}
                  placeholder="Entrez le nom d'utilisateur"
                />
                {searchUsername.trim() && (
                  <button className="btn btn-outline-secondary mt-2" onClick={clearSearch}>
                    Effacer la recherche
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Détails des Estimations de Tâches des Employés</h5>
              <h6 className="mb-3">
                {selectedEmployeeId !== 'all'
                  ? `Estimations de tâches pour ${employeeList.find(e => e.id === selectedEmployeeId)?.username || 'Employé non trouvé'}`
                  : searchUsername.trim()
                    ? `Résultats de la recherche pour "${searchUsername}"`
                    : 'Toutes les estimations de tâches de l\'équipe'}
              </h6>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Temps Estimé Total (min)</th>
                      <th>Temps Réalisé Total (min)</th>
                      <th>Violations d'Échéance</th>
                      <th>Période de Violation Totale (jours)</th>
                      <th>Début de Période</th>
                      <th>Fin de Période</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(estimation => (
                      <tr key={estimation.id}>
                        <td>{estimation.user.username}</td>
                        <td>{estimation.totalEstimatedTime}</td>
                        <td>{estimation.totalRealizedTime}</td>
                        <td>{estimation.numberOfDueDateViolations}</td>
                        <td>{estimation.totalViolationPeriod === null ? 'N/A' : estimation.totalViolationPeriod}</td>
                        <td>{estimation.periodStart}</td>
                        <td>{estimation.periodEnd}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="7">Aucune estimation de tâche trouvée pour la sélection.</td>
                      </tr>
                    )}
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

export default TaskTrackingManager;
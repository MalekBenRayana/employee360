import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import timeTrackingService from '../../services/timeTrackingService';
import { useAuth } from '../../auth/AuthContext';

const TimeTrackingManager = () => {
  const { collapsed } = useContext(LayoutContext);
  const [timeTrackingData, setTimeTrackingData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [employeeList, setEmployeeList] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalRetards, setTotalRetards] = useState(0);
  const [totalHeuresRequises, setTotalHeuresRequises] = useState(0);

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

        const timeTrackingInfo = teamStats.map(employee => ({
          employeeId: employee.employeeId,
          username: employee.username,
          email: employee.email,
          totalRetards: employee.totalRetards,
          totalHeuresRequises: employee.totalHeuresRequises,
          timeTrackingDetails: employee.timeTrackingDetails,
          projects: employee.projects,
        }));
        setTimeTrackingData(timeTrackingInfo);

        const employeeOptions = [{ id: 'all', name: 'Tous les employés' }];
        teamStats.forEach(employee => {
          employeeOptions.push({ id: employee.employeeId, name: employee.username });
        });
        setEmployeeList(employeeOptions);

        const usersData = teamStats.map(emp => ({ id: emp.employeeId, username: emp.username }));
        setUsers(usersData);

        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données de suivi du temps.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [managerId, role, authLoading]);

  const filteredData = useMemo(() => {
    
    
    let currentData = timeTrackingData;

    if (searchUsername.trim() && searchResults.length > 0) {
      const searchedEmployeeIds = new Set(searchResults.map(res => res.employeeId));
      currentData = currentData.filter(item => searchedEmployeeIds.has(item.employeeId));
    }

    if (selectedEmployeeId !== 'all') {
      currentData = currentData.filter(item => item.employeeId === parseInt(selectedEmployeeId));
    }

    return currentData;
  }, [timeTrackingData, selectedEmployeeId, searchUsername, searchResults]);


  useEffect(() => {
    const nbrTotalRetards = filteredData.reduce((sum, employee) => sum + employee.totalRetards, 0);
    const periodeTotaleRetards = filteredData.reduce((sum, employee) => sum + employee.totalHeuresRequises, 0);
    setTotalRetards(nbrTotalRetards);
    setTotalHeuresRequises(periodeTotaleRetards);
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

        const results = await timeTrackingService.getTeamStats(managerId);
        const filteredResults = results.filter(employee =>
          employee.username.toLowerCase().includes(username.toLowerCase())
        );

        const searchData = filteredResults.map(employee => ({
          employeeId: employee.employeeId,
          username: employee.username,
          email: employee.email,
          totalRetards: employee.totalRetards,
          totalHeuresRequises: employee.totalHeuresRequises,
          timeTrackingDetails: employee.timeTrackingDetails,
          projects: employee.projects,
        }));
        setSearchResults(searchData);
        setLoading(false);
      } catch (err) {
        setError(`Erreur lors de la recherche des données pour "${username}".`);
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




  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement des données de suivi du temps...</p>
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
          <h1>Suivi du Temps de l'Équipe</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Nombre Total de Retards de l'Équipe</h5>
                  <p className="card-text">{totalRetards}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total des Heures Requises de l'Équipe</h5>
                  <p className="card-text">{totalHeuresRequises}</p>
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
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
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
                {searchResults.length > 0 && (
                  <button className="btn btn-outline-secondary mt-2" onClick={clearSearch}>
                    Effacer la recherche
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Détails du Suivi du Temps des Employés</h5>
              <h6 className="mb-3">
                {selectedEmployeeId !== 'all'
                  ? `Suivi du temps pour ${employeeList.find(e => e.id === selectedEmployeeId)?.name || 'Employé non trouvé'}`
                  : searchResults.length > 0
                    ? `Résultats de la recherche pour "${searchUsername}"`
                    : 'Suivi du temps pour tous les employés'}
              </h6>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Projets</th>
                      <th>Total Retards</th>
                      <th>Total Heures Requises</th>
                      <th>Détails du Suivi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(employee => (
                      <tr key={employee.employeeId}>
                        <td>{employee.username}</td>
                        <td>
                          {employee.projects.map(project => (
                            <div key={project.project_id}>{project.project_name}</div>
                          ))}
                        </td>
                        <td>{employee.totalRetards}</td>
                        <td>{employee.totalHeuresRequises}</td>
                        <td>
                          {employee.timeTrackingDetails.length > 0 ? (
                            <ul>
                              {employee.timeTrackingDetails.map(track => (
                                <li key={track.id}>
                                  Du {new Date(track.startDate).toLocaleDateString()} au{' '}
                                  {new Date(track.endDate).toLocaleDateString()}:{' '}
                                  {track.heuresRequises} heures (Retards: {track.nbreRetards})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            'Aucun retard'
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="5">Aucune donnée de suivi du temps trouvée pour la sélection.</td>
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

export default TimeTrackingManager;
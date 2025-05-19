import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from '../Navbar'; // Assurez-vous que le chemin est correct
import '../../assets/styles/layout.css'; // Assurez-vous que le chemin est correct
import { LayoutContext } from '../../contexts/LayoutContext'; // Assurez-vous que le chemin est correct
import taskEstimationsService from '../../services/taskEstimationsService'; // Assurez-vous que le chemin est correct

const TasksTrackingAdmin = () => {
  const { collapsed } = useContext(LayoutContext);
  const [taskEstimations, setTaskEstimations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [employeeList, setEmployeeList] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [totalRealizedTime, setTotalRealizedTime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const estimations = await taskEstimationsService.getAllTaskEstimations();
        const usersData = estimations.map(est => est.user).filter((user, index, self) =>
          index === self.findIndex((t) => (
            t.id === user.id
          ))
        );
        setTaskEstimations(estimations);
        setUsers(usersData);

        const employeeOptions = [{ id: 'all', username: 'Tous les employés' }];
        usersData.forEach(user => {
          employeeOptions.push({ id: user.id, username: user.username });
        });
        setEmployeeList(employeeOptions);

        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return selectedEmployeeId === 'all'
      ? taskEstimations.filter(item =>
          !searchResults.length || searchResults.some(res => res.id === item.id)
        )
      : taskEstimations.filter(item =>
          item.user.id === parseInt(selectedEmployeeId) &&
          (!searchResults.length || searchResults.some(res => res.id === item.id))
        );
  }, [taskEstimations, selectedEmployeeId, searchResults]);

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

        const results = await taskEstimationsService.getAllTaskEstimations(); 
        const filteredResults = results.filter(estimation =>
          estimation.user.username.toLowerCase().includes(username.toLowerCase())
        );
        setSearchResults(filteredResults);
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

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement des données...</p>
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
          <h1>Suivi des Estimations de Tâches</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Temps Estimé Total (min)</h5>
                  <p className="card-text">{totalEstimatedTime}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Temps Réalisé Total (min)</h5>
                  <p className="card-text">{totalRealizedTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filtrer et Rechercher</h5>
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
                <label htmlFor="searchUsername" className="form-label">Rechercher par employé :</label>
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
              <h5 className="card-title">Détails des Estimations de Tâches</h5>
              <h6 className="mb-3">
                {selectedEmployeeId !== 'all'
                  ? `Estimations de tâches pour ${employeeList.find(e => e.id === selectedEmployeeId)?.username || 'Employé non trouvé'}`
                  : searchResults.length > 0
                    ? `Résultats de la recherche pour "${searchUsername}"`
                    : 'Toutes les estimations de tâches'}
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
                        <td>{estimation.totalViolationPeriod}</td>
                        <td>{estimation.periodStart}</td>
                        <td>{estimation.periodEnd}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="8">Aucune estimation de tâche trouvée pour la sélection.</td>
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

export default TasksTrackingAdmin;
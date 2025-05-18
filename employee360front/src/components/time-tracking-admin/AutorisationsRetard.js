import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import gestionRetardsService from '../../services/gestionRetardsService';

const GestionRetards = () => {
  const { collapsed } = useContext(LayoutContext);
  const [retardData, setRetardData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [employeeList, setEmployeeList] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalRetards, setTotalRetards] = useState(0);
  const [totalHeuresRequises, setTotalHeuresRequises] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const retards = await gestionRetardsService.getAllRetards();
        const usersData = await gestionRetardsService.getAllUsers();
        setRetardData(retards);
        setUsers(usersData);

        const employeeOptions = [{ id: 'all', name: 'Tous les employés' }];
        usersData.forEach(user => {
          employeeOptions.push({ id: user.id, name: user.username });
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
      ? retardData.filter(item => !searchResults.length || searchResults.some(res => res.id === item.id))
      : retardData.filter(item => item.userId === parseInt(selectedEmployeeId) && (!searchResults.length || searchResults.some(res => res.id === item.id)));
  }, [retardData, selectedEmployeeId, searchResults]);

  useEffect(() => {
    const nbrTotalRetards = filteredData.reduce((sum, item) => sum + item.nbreRetards, 0);
    const periodeTotaleRetards = filteredData.reduce((sum, item) => sum + (item.heuresRequises || 0), 0);
    setTotalRetards(nbrTotalRetards);
    setTotalHeuresRequises(periodeTotaleRetards);
  }, [filteredData]);

  const getUsername = (userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.username : `Employé ${userId}`;
  };

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
        const results = await gestionRetardsService.getRetardsByUser(username);
        setSearchResults(results);
        setLoading(false);
      } catch (err) {
        setError(`Erreur lors de la recherche des retards pour "${username}".`);
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
          <h1>Suivi des Retards</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Nombre Total de Retards</h5>
                  <p className="card-text">{totalRetards}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Période Totale des Retards (Heures)</h5>
                  <p className="card-text">{totalHeuresRequises}</p>
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
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
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
              <h5 className="card-title">Détails des Retards</h5>
              <h6 className="mb-3">
                {selectedEmployeeId !== 'all'
                  ? `Retards pour ${employeeList.find(e => e.id === selectedEmployeeId)?.name || 'Employé non trouvé'}`
                  : searchResults.length > 0
                    ? `Résultats de la recherche pour "${searchUsername}"`
                    : 'Tous les retards'}
              </h6>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employé</th>
                      <th>Nombre de Retards</th>
                      <th>Date de Début</th>
                      <th>Date de Fin</th>
                      <th>Heures Requises</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(retard => (
                      <tr key={retard.id}>
                        <td>{retard.id}</td>
                        <td>{getUsername(retard.userId)}</td>
                        <td>{retard.nbreRetards}</td>
                        <td>{retard.startDate}</td>
                        <td>{retard.endDate}</td>
                        <td>{retard.heuresRequises}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && <tr><td colSpan="6">Aucun retard trouvé pour la sélection.</td></tr>}
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

export default GestionRetards;
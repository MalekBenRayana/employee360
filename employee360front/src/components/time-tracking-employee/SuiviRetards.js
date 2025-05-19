import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import gestionRetardsService from '../../services/timeTrackingService';
import { useAuth } from '../../auth/AuthContext';

const SuiviRetards = () => {
  const { collapsed } = useContext(LayoutContext);
  const { userId: loggedInUserId, authLoading } = useAuth();
  const [retardData, setRetardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRetards, setTotalRetards] = useState(0);
  const [totalHeuresRequises, setTotalHeuresRequises] = useState(0);

  useEffect(() => {
    const fetchMyRetards = async () => {
      if (!authLoading && loggedInUserId) {
        setLoading(true);
        setError(null);
        console.log("Fetching retards for user ID:", loggedInUserId);

        try {
          const retards = await gestionRetardsService.getRetardsByUserId(loggedInUserId);
          setRetardData(retards);
          console.log("Retard data received:", retards);
          setLoading(false);
        } catch (err) {
          setError('Erreur lors de la récupération de vos retards.');
          console.error(err);
          setLoading(false);
        }
      } else if (authLoading) {
        console.log("Authentification en cours de chargement, attendez avant de récupérer les retards.");
      } else {
        console.log("loggedInUserId est undefined ou authLoading est false, skipping fetch.");
      }
    };

    fetchMyRetards();
  }, [loggedInUserId, authLoading]);

  useEffect(() => {
    console.log("Inside the total calculation useEffect");
    console.log("Current retardData before reduce:", JSON.stringify(retardData));

    const nbrTotalRetards = retardData.reduce((sum, item) => {
      console.log("Processing item for total retards:", item);
      console.log("Adding:", item.nbreRetards, "to sum:", sum);
      return sum + (item.nbreRetards || 0);
    }, 0);

    const periodeTotaleRetards = retardData.reduce((sum, item) => {
      console.log("Processing item for total heures:", item);
      console.log("Adding:", item.heuresRequises, "to sum:", sum);
      return sum + (item.heuresRequises || 0);
    }, 0);

    setTotalRetards(nbrTotalRetards);
    setTotalHeuresRequises(periodeTotaleRetards);
    console.log("Total retards:", nbrTotalRetards, "Total heures:", periodeTotaleRetards);
  }, [retardData]);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement de vos retards...</p>
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
          <h1>Mes Retards</h1>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card card-summary">
                <div className="card-body">
                  <h5 className="card-title">Nombre Total de Mes Retards</h5>
                  <p className="card-text">{totalRetards}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-summary">
                <div className="card-body">
                  <h5 className="card-title">Période Totale de Mes Retards (Heures)</h5>
                  <p className="card-text">{totalHeuresRequises}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Détails de Mes Retards</h5>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de Retards</th>
                      <th>Date de Début</th>
                      <th>Date de Fin</th>
                      <th>Heures Requises</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retardData.map(retard => (
                      <tr key={retard.id}>
                        <td>{retard.id}</td>
                        <td>{retard.nbreRetards}</td>
                        <td>{retard.startDate}</td>
                        <td>{retard.endDate}</td>
                        <td>{retard.heuresRequises}</td>
                      </tr>
                    ))}
                    {retardData.length === 0 && <tr><td colSpan="5">Aucun retard trouvé.</td></tr>}
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

export default SuiviRetards;
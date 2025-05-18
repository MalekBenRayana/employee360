import React, { useState, useEffect } from 'react';
import { fetchAssignedEvaluationSessionsByStatus } from '../../services/evaluationSessionService';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import { useContext } from 'react';

const AssignedEvaluationsView = () => {
  const { userId, loading: authLoading } = useAuth();
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { collapsed } = useContext(LayoutContext);

  console.log("AssignedEvaluationsView - userId:", userId);
  console.log("AssignedEvaluationsView - authLoading:", authLoading);

  useEffect(() => {
    const loadPendingEvaluations = async () => {
      if (!authLoading && userId) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchAssignedEvaluationSessionsByStatus(userId, 'pending');
          console.log("AssignedEvaluationsView - Données récupérées:", data);
          setPendingEvaluations(data);
        } catch (err) {
          setError('Erreur lors de la récupération des évaluations assignées.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (authLoading) {
        console.log("AssignedEvaluationsView - Authentification en cours de chargement...");
      } else if (!userId) {
        console.log("AssignedEvaluationsView - userId n'est pas encore défini.");
        setPendingEvaluations([]);
        setLoading(false);
      }
    };

    loadPendingEvaluations();
  }, [userId, authLoading]);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement des évaluations...</p>
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
            <div className="alert alert-danger" role="alert">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (pendingEvaluations.length === 0) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <div className="alert alert-info" role="alert">Aucune évaluation à réaliser pour le moment.</div>
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
          <h2>Évaluations à réaliser</h2>
          <div className="row">
            {pendingEvaluations.map(session => (
              <div key={session.id} className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Évaluation pour : {session.evaluatee.username}</h5>
                    <p className="card-text">
                      <strong>Email :</strong> {session.evaluatee.email}
                      <br />
                      <strong>Projet :</strong> {session.project ? session.project.project_name : 'N/A'}
                      <br />
                      <strong>Formulaire :</strong> {session.form.name}
                    </p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedEvaluationsView;
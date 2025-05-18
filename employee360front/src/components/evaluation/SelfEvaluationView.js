import React, { useState, useEffect } from 'react';
import { fetchSelfEvaluationSessions } from '../../services/evaluationSessionService';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import { useContext } from 'react';

const SelfEvaluationView = () => {
  const { userId } = useAuth();
  const [selfEvaluationSession, setSelfEvaluationSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { collapsed } = useContext(LayoutContext);

  useEffect(() => {
    const loadSelfEvaluation = async () => {
      setLoading(true);
      setError(null);
      try {
        if (userId) {
          const data = await fetchSelfEvaluationSessions(userId);
          setSelfEvaluationSession(Array.isArray(data) && data.length > 0 ? data[0] : data);
        }
      } catch (err) {
        setError('Erreur lors de la récupération de l\'auto-évaluation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSelfEvaluation();
  }, [userId]);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <p>Chargement de l'auto-évaluation...</p>
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

  if (!selfEvaluationSession) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid mt-4">
            <div className="alert alert-info" role="alert">Aucune auto-évaluation assignée pour le moment.</div>
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
          <h2>Auto-évaluation</h2>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Informations sur l'auto-évaluation</h5>
              <p className="card-text">
                <strong>Formulaire :</strong> {selfEvaluationSession.form ? selfEvaluationSession.form.name : 'N/A'}
                <br />
                <strong>Projet :</strong> {selfEvaluationSession.project ? selfEvaluationSession.project.project_name : 'N/A'}
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfEvaluationView;
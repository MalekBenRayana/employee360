import React, { useState, useEffect, useContext } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import Navbar from '../Navbar';
 import { LayoutContext } from '../../contexts/LayoutContext';
 import '../../assets/styles/evaluation-session-creator.css';
 import { FaArrowLeft } from 'react-icons/fa';
 import { toast, ToastContainer } from 'react-toastify';
 import 'react-toastify/dist/ReactToastify.css';
 import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
 import Select from 'react-select';
 import { fetchEvaluationForms, createEvaluationSession } from '../../services/evaluationSessionService';
 import { getUsers as fetchUsers } from '../../services/userService';
 import { getProjectsByUser } from '../../services/projectsService';

 const EvaluationSessionCreator = () => {
  const navigate = useNavigate();
  const { collapsed } = useContext(LayoutContext);
  const [forms, setForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [selectedEvaluateeId, setSelectedEvaluateeId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   const fetchData = async () => {
    setLoading(true);
    try {
     const formsData = await fetchEvaluationForms();
     setForms(formsData);
     const usersData = await fetchUsers();
     setUsers(usersData);

     if (selectedEvaluateeId) {
      const projectsData = await getProjectsByUser(selectedEvaluateeId);
      setProjects(projectsData);
      console.log("Projets de l'utilisateur récupérés :", projectsData);
     } else {
      setProjects([]);
     }

    } catch (err) {
     setError('Erreur lors de la récupération des données.');
     console.error(err);
    } finally {
     setLoading(false);
    }
   };

   fetchData();
  }, [selectedEvaluateeId]);

  const handleFormChange = (event) => {
   setSelectedFormId(event.target.value);
  };

  const handleEvaluatorChange = (selectedOptions) => {
   setSelectedEvaluators(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleEvaluateeChange = (event) => {
   setSelectedEvaluateeId(event.target.value);
   setSelectedProjectId('');
  };

  const handleProjectChange = (event) => {
   setSelectedProjectId(event.target.value);
  };

  const handleSubmit = async (event) => {
   event.preventDefault();

   
   const sessionData = {
    formId: selectedFormId,
    userId: loggedInUserId(),
    evaluateeId: selectedEvaluateeId,
    projectId: selectedProjectId,
    status: 'pending',
   };

   try {
    const response = await createEvaluationSession(sessionData);

    if (response && response.sessionId) {
     toast.success('Session d\'évaluation créée avec succès!');
     navigate('/evaluation-sessions');
    } else {
     toast.error('Erreur lors de la création de la session d\'évaluation : ID de session non reçu.');
    }

   } catch (err) {
    toast.error('Erreur lors de la création de la session d\'évaluation.');
    console.error(err);
   }
  };

  const loggedInUserId = () => {
   return 1;
  };

  const userOptions = users.map(user => ({ value: user.id, label: `${user.username} (${user.email})` }));
  const formOptions = forms.map(form => ({ value: form.id, label: form.name }));
  const projectOptions = projects.map(project => ({ value: project.project_id, label: project.project_name }));
  console.log("Options des projets :", projectOptions);

  if (loading) {
   return <p>Chargement des données...</p>;
  }

  if (error) {
   return <Alert variant="danger">{error}</Alert>;
  }

  return (
   <div className="app-layout">
    <Navbar />
    <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
     <div className="container-fluid py-5 evaluation-session-creator-container">
      <div className="mb-4">
       <Link to="/evaluation-sessions" className="btn btn-outline-secondary rounded-pill me-2 shadow-sm">
        <FaArrowLeft className="me-2" /> Retour aux Sessions
       </Link>
       <h2 className="display-4 text-primary font-weight-bold mt-3">Ouvrir une Session d'Évaluation</h2>
       <p className="lead text-secondary">Sélectionnez le formulaire, l'employé à évaluer et le projet associé.</p>
      </div>

      <Card className="shadow-lg rounded-3 border-0">
       <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
         <Form.Group className="mb-3" controlId="formId">
          <Form.Label className="font-weight-bold">Formulaire d'évaluation</Form.Label>
          <Form.Select value={selectedFormId} onChange={handleFormChange} required>
           <option value="">Sélectionner un formulaire</option>
           {formOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
           ))}
          </Form.Select>
         </Form.Group>

         <Form.Group className="mb-3" controlId="evaluateeId">
          <Form.Label className="font-weight-bold">Employé à évaluer</Form.Label>
          <Form.Select value={selectedEvaluateeId} onChange={handleEvaluateeChange} required>
           <option value="">Sélectionner un employé</option>
           {userOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
           ))}
          </Form.Select>
         </Form.Group>

         <Form.Group className="mb-3" controlId="projectId">
          <Form.Label className="font-weight-bold">Projet Associé</Form.Label>
          <Form.Select value={selectedProjectId} onChange={handleProjectChange} required>
           <option value="">Sélectionner un projet</option>
           {projectOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
           ))}
          </Form.Select>
          <Form.Text className="text-muted">Sélectionnez le projet sur lequel l'évaluateur et l'évalué ont travaillé ensemble.</Form.Text>
         </Form.Group>

         

         {error && <Alert variant="danger">{error}</Alert>}

         <Button type="submit" className="rounded-pill shadow-sm font-weight-bold">Créer la Session</Button>
        </Form>
       </Card.Body>
      </Card>
     </div>
    </div>
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
   </div>
  );
 };

 export default EvaluationSessionCreator;
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaTimes, FaListAlt, FaEdit } from 'react-icons/fa';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import '../../assets/styles/evaluation-form-creator.css';
import { fetchForm, saveForm } from '../../services/evaluationFormService';
import { getAll as getAllPerformancePointTypes } from '../../services/performancePointTypeService';

const EvaluationFormCreator = () => {
  const [formName, setFormName] = useState('');
  const [formStructure, setFormStructure] = useState({ questions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const { collapsed } = useContext(LayoutContext);
  const [questionCounter, setQuestionCounter] = useState(1);
  const [performancePointTypes, setPerformancePointTypes] = useState([]);

  useEffect(() => {
    if (id) {
      const loadForm = async () => {
        setLoading(true);
        try {
          const data = await fetchForm(id);
          setFormName(data.name);
          setFormStructure(data.form_structure || { questions: [] });
          setQuestionCounter(data.form_structure?.questions?.length + 1 || 1);
        } catch (err) {
          setError('Erreur lors du chargement du formulaire.');
        } finally {
          setLoading(false);
        }
      };
      loadForm();
    } else {
      setQuestionCounter(1);
    }

    const loadPerformancePointTypes = async () => {
      try {
        const data = await getAllPerformancePointTypes(); // Utilisation de la fonction importée
        setPerformancePointTypes(data);
      } catch (err) {
        console.error('Erreur lors du chargement des types de points de performance:', err);
        setError('Erreur lors du chargement des types de points de performance.');
      }
    };

    loadPerformancePointTypes();
  }, [id]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '_')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const extractSignificantWords = (text) => {
    if (!text) {
      return [];
    }
    const words = text.toLowerCase().trim().split(/\s+/);
    const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'à', 'en', 'pour', 'par', 'sur', 'est', 'et', 'qui', 'que', 'quoi', 'comment', 'où'];
    const significantWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
    return significantWords.slice(0, 3);
  };

  const generateQuestionId = (label) => {
    const significantWords = extractSignificantWords(label);
    const slugifiedId = significantWords.join('_');

    if (slugifiedId) {
      return slugifiedId;
    }
    const currentCounter = questionCounter;
    setQuestionCounter(prevCounter => prevCounter + 1);
    return `question_${currentCounter}`;
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: generateQuestionId('Nouvelle Question'),
      type: 'text_short',
      label: '',
      options: [],
      min: null,
      max: null,
      required: false,
      performancePointTypeId: null
    };
    setFormStructure(prevStructure => ({
      questions: [...prevStructure.questions, newQuestion]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formStructure.questions];
    const currentQuestion = updatedQuestions[index];

    if (field === 'label') {
      updatedQuestions[index].id = generateQuestionId(value);
    }

    updatedQuestions[index][field] = value;
    setFormStructure({ questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formStructure.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    if (!updatedQuestions[questionIndex].options[optionIndex]) {
      updatedQuestions[questionIndex].options[optionIndex] = { label: '', value: '' };
    }
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setFormStructure({ questions: updatedQuestions });
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...formStructure.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options.push({ label: '', value: '' });
    setFormStructure({ questions: updatedQuestions });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formStructure.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setFormStructure({ questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = formStructure.questions.filter((_, i) => i !== index);
    setFormStructure({ questions: updatedQuestions });
  };

  const handleSaveForm = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const formData = {
        name: formName,
        form_structure: formStructure
      };
      await saveForm(formData, id);
      setSuccessMessage(`Formulaire ${id ? 'mis à jour' : 'créé'} avec succès!`);
      setTimeout(() => {
        navigate('/evaluation-forms');
      }, 1500);
    } catch (err) {
      setError('Erreur lors de la sauvegarde du formulaire.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
          <div className="container-fluid py-5 loading-container">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
            <p className="mt-2 text-muted">Chargement du formulaire...</p>
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
          <div className="container-fluid py-5 error-message alert alert-danger shadow-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
        <div className="container-fluid py-5 evaluation-form-creator-container">
          <div className="mb-4">
            <h2 className="display-4 text-primary font-weight-bold mb-3">
              {id ? <><FaEdit className="me-2" /> Modifier le Formulaire</> : <><FaPlus className="me-2" /> Créer un Nouveau Formulaire</>}
            </h2>
            <p className="lead text-secondary">
              {id ? 'Modifiez la structure et le nom du formulaire d\'évaluation.' : 'Créez une nouvelle structure de formulaire d\'évaluation pour les employés.'}
            </p>
            <Link to="/evaluation-forms" className="btn btn-outline-secondary rounded-pill me-2 shadow-sm">
              <FaListAlt className="me-2" /> Liste des Formulaires
            </Link>
          </div>

          {successMessage && (
            <div className="alert alert-success shadow-sm mb-3">{successMessage}</div>
          )}

          <div className="card shadow-lg rounded-3 border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title font-weight-bold text-muted mb-3">Informations Générales</h5>
              <div className="mb-3">
                <label htmlFor="formName" className="form-label font-weight-bold">Nom du Formulaire:</label>
                <input
                  type="text"
                  className="form-control rounded-pill shadow-sm"
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <h3 className="font-weight-bold text-muted mb-3">Structure du Formulaire</h3>
          {formStructure.questions.map((question, index) => (
            <div key={question.id} className="card shadow-sm rounded-3 border-0 mb-3">
              <div className="card-body p-3">
                <h5 className="font-weight-bold text-info mb-2">Question {index + 1}</h5>
                <div className="mb-2">
                  <label className="form-label font-weight-bold">Libellé:</label>
                  <input
                    type="text"
                    className="form-control rounded-pill shadow-sm"
                    value={question.label}
                    onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label font-weight-bold">Type:</label>
                  <select
                    className="form-select rounded-pill shadow-sm"
                    value={question.type}
                    onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                  >
                    <option value="text_short">Texte Court</option>
                    <option value="text_long">Texte Long</option>
                    <option value="radio">Choix Unique</option>
                    <option value="checkbox">Choix Multiple</option>
                    <option value="scale">Échelle</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label font-weight-bold">Type de Point de Performance:</label>
                  <select
                    className="form-select rounded-pill shadow-sm"
                    value={question.performancePointTypeId || ''}
                    onChange={(e) => handleQuestionChange(index, 'performancePointTypeId', e.target.value)}
                  >
                    <option value="">-- Sélectionner un Type de Point --</option>
                    {performancePointTypes.map(ppt => (
                      <option key={ppt.id} value={ppt.id}>{ppt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input shadow-sm"
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                    id={`required-${question.id}`}
                  />
                  <label className="form-check-label font-weight-bold" htmlFor={`required-${question.id}`}>Obligatoire</label>
                </div>

                {question.type === 'radio' || question.type === 'checkbox' ? (
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Options:</label>
                    {question.options && question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Libellé"
                          value={option.label}
                          onChange={(e) => handleOptionChange(index, optionIndex, 'label', e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Valeur"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, optionIndex, 'value', e.target.value)}
                        />
                        <button className="btn btn-outline-danger rounded-pill" type="button" onClick={() => handleRemoveOption(index, optionIndex)}>
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-success rounded-pill btn-sm" onClick={() => handleAddOption(index)}>
                      <FaPlus /> Ajouter Option
                    </button>
                  </div>
                ) : null}

                {question.type === 'scale' ? (
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <label className="form-label font-weight-bold">Min:</label>
                      <input
                        type="number"
                        className="form-control rounded-pill shadow-sm"
                        value={question.min || ''}
                        onChange={(e) => handleQuestionChange(index, 'min', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label font-weight-bold">Max:</label>
                      <input
                        type="number"
                        className="form-control rounded-pill shadow-sm"
                        value={question.max || ''}
                        onChange={(e) => handleQuestionChange(index, 'max', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ) : null}

                <button type="button" className="btn btn-outline-danger rounded-pill btn-sm mt-2" onClick={() => handleRemoveQuestion(index)}>
                  <FaTrash /> Supprimer Question
                </button>
              </div>
            </div>
          ))}

          <div className="mt-3">
            <button type="button" className="btn btn-success rounded-pill shadow-sm font-weight-bold me-2" onClick={handleAddQuestion}>
              <FaPlus className="me-2" /> Ajouter une Question
            </button>
            <button type="button" className="btn btn-primary rounded-pill shadow-sm font-weight-bold" onClick={handleSaveForm} disabled={loading}>
              <FaSave className="me-2" /> {loading ? 'Sauvegarde...' : 'Sauvegarder le Formulaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationFormCreator;
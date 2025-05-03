import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import '../../assets/styles/evaluation-form-responder.css';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { fetchFormToRespond, submitResponse } from '../../services/evaluationResponseService';

const TextQuestion = ({ question, value, onChange }) => (
  <div className="form-group-innovative">
    <label htmlFor={`question-${question.id}`} className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <input
      type="text"
      className="form-control-innovative"
      id={`question-${question.id}`}
      value={value || ''}
      onChange={onChange}
    />
  </div>
);

const TextAreaQuestion = ({ question, value, onChange }) => (
  <div className="form-group-innovative">
    <label htmlFor={`question-${question.id}`} className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <textarea
      className="form-control-innovative"
      id={`question-${question.id}`}
      rows="4"
      value={value || ''}
      onChange={onChange}
    />
  </div>
);

const RadioQuestion = ({ question, value, onChange }) => (
  <div className="form-group-innovative">
    <label className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <div className="form-options-innovative">
      {question.options.map((option, index) => (
        <div className="form-check-innovative" key={index}>
          <input
            type="radio"
            className="form-check-input-innovative"
            name={`question-${question.id}`}
            id={`option-${question.id}-${index}`}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          <label className="form-check-label-innovative" htmlFor={`option-${question.id}-${index}`}>
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

const CheckboxQuestion = ({ question, values, onChange }) => (
  <div className="form-group-innovative">
    <label className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <div className="form-options-innovative">
      {question.options.map((option, index) => (
        <div className="form-check-innovative" key={index}>
          <input
            type="checkbox"
            className="form-check-input-innovative"
            id={`option-${question.id}-${index}`}
            value={option.value}
            checked={values.includes(option.value)}
            onChange={(e) => {
              const newValue = e.target.checked
                ? [...values, option.value]
                : values.filter(v => v !== option.value);
              onChange(newValue);
            }}
          />
          <label className="form-check-label-innovative" htmlFor={`option-${question.id}-${index}`}>
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

const SelectQuestion = ({ question, value, onChange }) => (
  <div className="form-group-innovative">
    <label htmlFor={`question-${question.id}`} className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <select
      className="form-select-innovative"
      id={`question-${question.id}`}
      value={value || ''}
      onChange={onChange}
    >
      <option value="">Sélectionnez une option</option>
      {question.options.map((option, index) => (
        <option key={index} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const ScaleQuestion = ({ question, value, onChange }) => (
  <div className="form-group-innovative">
    <label htmlFor={`question-${question.id}`} className="form-label-innovative">
      {question.label}
      {question.isRequired && <span className="required-innovative">*</span>}
      {question.description && (
        <FontAwesomeIcon icon={faQuestionCircle} className="question-icon-innovative" title={question.description} />
      )}
    </label>
    <div className="form-scale-innovative">
      <div className="scale-labels-innovative">
        <span>{question.min}</span>
        <span>{question.max}</span>
      </div>
      <input
        type="range"
        className="form-range-innovative"
        min={question.min}
        max={question.max}
        value={value !== undefined ? value : question.min}
        id={`question-${question.id}`}
        onChange={onChange}
        style={{ width: '100%' }}
      />
      <div className="scale-values-innovative">
        {Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min + i).map((val) => (
          <span
            key={val}
            style={{
              left: `${((val - question.min) / (question.max - question.min)) * 100}%`,
            }}
            className={`scale-value-indicator-innovative ${value === String(val) ? 'active' : ''}`}
          >
            {val}
          </span>
        ))}
      </div>
      {value !== undefined && (
        <p className="mt-2 text-muted">Valeur sélectionnée: {value}</p>
      )}
    </div>
  </div>
);

const EvaluationFormResponder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formStructure, setFormStructure] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { collapsed } = useContext(LayoutContext);
  const { user: loggedInUser } = useAuth();

  const [sessionId, setSessionId] = useState(null);
  const [evaluatorId, setEvaluatorId] = useState(null);
  const [evaluateeId, setEvaluateeId] = useState(null);

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        const sessionIdFromUrl = searchParams.get('sessionId');
        setSessionId(sessionIdFromUrl ? parseInt(sessionIdFromUrl) : null);

        const evaluatorIdFromUrl = searchParams.get('evaluatorId');
        setEvaluatorId(evaluatorIdFromUrl ? parseInt(evaluatorIdFromUrl) : loggedInUser?.id);

        const formData = await fetchFormToRespond(formId, sessionIdFromUrl, evaluatorIdFromUrl);
        setFormStructure(formData.formStructure);
        setEvaluateeId(formData.evaluateeId);

      } catch (err) {
        setError('Impossible de charger le formulaire.');
        console.error('Erreur de récupération des données:', err);
        toast.error(
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-danger" />
            Impossible de charger le formulaire. Veuillez réessayer.
          </motion.div>
        );
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId, searchParams, loggedInUser?.id]);

  const handleInputChange = (questionId, value) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sessionId || !evaluatorId || !evaluateeId) {
      toast.error(
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-warning" />
          Informations de session manquantes.
        </motion.div>
      );
      return;
    }

    const submissionData = {
      sessionId: sessionId,
      evaluatorId: evaluatorId,
      evaluateeId: evaluateeId,
      answers: responses,
    };


    try {
      await submitResponse(submissionData);
      toast.success(
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-success" />
          Évaluation soumise avec succès !
        </motion.div>,
      );
    } catch (err) {
      setError('Erreur lors de la soumission des réponses.');
      console.error('Erreur de soumission:', err);
      toast.error(
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-danger" />
          Erreur lors de la soumission. Veuillez vérifier vos réponses.
        </motion.div>
      );
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <motion.div
          className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'} loading-container-innovative`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loader-innovative"></div>
          <p className="mt-2 text-muted">Chargement du formulaire...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Navbar />
        <motion.div
          className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'} error-message-innovative`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="alert-innovative">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
            {error}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <motion.div
        className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'} evaluation-form-container-innovative`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-header-innovative">
          <h2 className="form-title-innovative">Répondre à l'Évaluation</h2>
          {formStructure?.questions && (
            <div className="progress-bar-container-innovative">
              <div className="progress-bar-innovative" style={{ width: `${(Object.keys(responses).length / formStructure.questions.length) * 100}%` }}></div>
              <span className="progress-text-innovative">{Object.keys(responses).length} / {formStructure.questions.length}</span>
            </div>
          )}
        </div>
        {formStructure && formStructure.questions && (
          <form onSubmit={handleSubmit} className="evaluation-form-innovative">
            <div className="questions-grid-innovative">
              {formStructure.questions.map((question) => {
                const responseValue = responses[question.id];
                const handleResponseChange = (newValue) => handleInputChange(question.id, newValue);

                switch (question.type) {
                  case 'text':
                  case 'text_short':
                    return <TextQuestion key={question.id} question={question} value={responseValue} onChange={(e) => handleResponseChange(e.target.value)} />;
                  case 'textarea':
                    return <TextAreaQuestion key={question.id} question={question} value={responseValue} onChange={(e) => handleResponseChange(e.target.value)} />;
                  case 'radio':
                    return <RadioQuestion key={question.id} question={question} value={responseValue} onChange={(e) => handleResponseChange(e.target.value)} />;
                  case 'checkbox':
                    return <CheckboxQuestion key={question.id} question={question} values={responseValue || []} onChange={handleResponseChange} />;
                  case 'select':
                    return <SelectQuestion key={question.id} question={question} value={responseValue} onChange={(e) => handleResponseChange(e.target.value)} />;
                  case 'scale':
                    return <ScaleQuestion key={question.id} question={question} value={responseValue} onChange={(e) => handleResponseChange(e.target.value)} />;
                  default:
                    return <div key={question.id}>Type de question non supporté : {question.type}</div>;
                }
              })}
            </div>
            <motion.button
              type="submit"
              className="submit-button-innovative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Soumettre l'Évaluation
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EvaluationFormResponder;
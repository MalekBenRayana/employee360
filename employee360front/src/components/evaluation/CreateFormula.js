import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchForms, fetchForm } from '../../services/evaluationFormService';
import { getFormulaById, createFormula, updateFormula } from '../../services/formulaService';

const CreateFormula = ({ onSave, onCancel, editingFormulaId }) => {
  const [formData, setFormData] = useState({
    formId: 0,
    expression: {},
  });
  const [forms, setForms] = useState([]);
  const [selectedFormStructure, setSelectedFormStructure] = useState(null);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingFormula, setLoadingFormula] = useState(false);
  const [loadingSelectedForm, setLoadingSelectedForm] = useState(false);
  const [errorForms, setErrorForms] = useState(null);
  const [errorFormula, setErrorFormula] = useState(null);
  const [errorSelectedForm, setErrorSelectedForm] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const formsData = await fetchForms();
        setForms(formsData);
      } catch (err) {
        setErrorForms(err.message || 'Erreur lors de la récupération des formulaires.');
        toast.error(err.message || 'Erreur lors de la récupération des formulaires.');
      } finally {
        setLoadingForms(false);
      }
    };

    fetchFormData();
  }, []);

  useEffect(() => {
    const fetchFormulaToEdit = async () => {
      if (editingFormulaId) {
        setLoadingFormula(true);
        try {
          const formula = await getFormulaById(editingFormulaId);
          setFormData({
            formId: formula.form?.id || 0,
            expression: formula.expression || {},
          });
          if (formula.form?.id) {
            loadSelectedFormStructure(formula.form.id);
          }
        } catch (err) {
          setErrorFormula(err.message || 'Erreur lors de la récupération de la formule pour l\'édition.');
          toast.error(err.message || 'Erreur lors de la récupération de la formule pour l\'édition.');
        } finally {
          setLoadingFormula(false);
        }
      } else {
        setFormData({ formId: 0, expression: {} });
        setSelectedFormStructure(null);
      }
    };

    fetchFormulaToEdit();
  }, [editingFormulaId, forms]);

  const loadSelectedFormStructure = async (formId) => {
    setLoadingSelectedForm(true);
    setErrorSelectedForm(null);
    try {
      const form = await fetchForm(formId);
      setSelectedFormStructure(form.form_structure);
      const initialExpression = {};
      form.form_structure?.questions?.forEach(q => {
        initialExpression[q.id] = '';
      });
      setFormData(prev => ({ ...prev, expression: initialExpression }));
    } catch (error) {
      setErrorSelectedForm('Erreur lors du chargement de la structure du formulaire.');
      toast.error('Erreur lors du chargement de la structure du formulaire.');
    } finally {
      setLoadingSelectedForm(false);
    }
  };

  const handleFormChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData(prev => ({ ...prev, formId: value }));
    if (value !== 0) {
      loadSelectedFormStructure(value);
    } else {
      setSelectedFormStructure(null);
      setFormData(prev => ({ ...prev, expression: {} }));
    }
  };

  const handleExpressionChange = (questionId, expression) => {
    setFormData(prev => ({
      ...prev,
      expression: {
        ...prev.expression,
        [questionId]: expression,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.formId || Object.keys(formData.expression).length === 0) {
      toast.error("Veuillez sélectionner un formulaire et définir des expressions pour les questions.");
      return;
    }

    try {
      const payload = {
        formId: formData.formId,
        expression: formData.expression,
      };
      if (editingFormulaId) {
        await updateFormula(editingFormulaId, payload);
        toast.success("Formule mise à jour avec succès.");
      } else {
        await createFormula(payload);
        toast.success("Formule créée avec succès.");
      }
      onSave(formData);
    } catch (err) {
      toast.error(err.message || `Erreur lors de l'enregistrement de la formule.`);
    }
  };

  return (
    <Card className="shadow-lg rounded-3 border-0">
      <Card.Body className="p-4">
        <div className="mb-4">
          <Button variant="outline-secondary" className="rounded-pill me-2 shadow-sm" onClick={onCancel}>
            <FaArrowLeft className="me-2" /> Retour
          </Button>
          <h2 className="display-4 text-primary font-weight-bold mt-3">{editingFormulaId ? 'Modifier la Formule' : 'Ajouter une Formule'}</h2>
          <p className="lead text-secondary">{editingFormulaId ? 'Modifiez les expressions des questions.' : 'Définissez l\'expression pour chaque question du formulaire.'}</p>
        </div>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="font-weight-bold">Formulaire d'évaluation</Form.Label>
            {loadingForms ? (
              <Form.Control as="select" disabled>
                <option>Chargement...</option>
              </Form.Control>
            ) : errorForms ? (
              <Alert variant="danger">{errorForms}</Alert>
            ) : (
              <Form.Control as="select" name="formId" value={formData.formId} onChange={handleFormChange} required>
                <option value={0}>Sélectionner un formulaire</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>{form.name}</option>
                ))}
              </Form.Control>
            )}
          </Form.Group>

          {formData.formId !== 0 && selectedFormStructure?.questions && (
            <div className="mb-3">
              <Form.Label className="font-weight-bold">Définition des Expressions par Question</Form.Label>
              {loadingSelectedForm ? (
                <Alert variant="info">Chargement des questions...</Alert>
              ) : errorSelectedForm ? (
                <Alert variant="danger">{errorSelectedForm}</Alert>
              ) : (
                <div className="border p-2 rounded">
                  {selectedFormStructure.questions.map(question => (
                    <div key={question.id} className="mb-3 p-2 border-bottom">
                      <Form.Label className="font-weight-semibold">{question.label || question.id} ({question.id})</Form.Label>
                      {question.type === 'scale' && (
                        <Form.Group className="mb-2">
                          <Form.Label>Expression pour la question (Échelle)</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: weight * response"
                            value={formData.expression[question.id] || ''}
                            onChange={(e) => handleExpressionChange(question.id, e.target.value)}
                          />
                          <Form.Text className="text-muted">Utilisez 'weight' pour le poids du type de point et 'response' pour la réponse.</Form.Text>
                        </Form.Group>
                      )}
                      {question.type === 'checkbox' && (
                        <Form.Group className="mb-2">
                          <Form.Label>Expression pour la question (Checkbox)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ex: map{'1': 1, '2': 2, '3': 3}"
                            value={formData.expression[question.id] || ''}
                            onChange={(e) => handleExpressionChange(question.id, e.target.value)}
                          />
                          <Form.Text className="text-muted">Utilisez 'map' suivi d'un objet JSON pour mapper les valeurs aux scores.</Form.Text>
                        </Form.Group>
                      )}
                      {/* Vous pouvez ajouter d'autres conditions pour d'autres types de questions (radio, etc.) */}
                      {question.type !== 'scale' && question.type !== 'checkbox' && (
                        <Form.Group className="mb-2">
                          <Form.Label>Expression pour la question ({question.type})</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Définissez l'expression"
                            value={formData.expression[question.id] || ''}
                            onChange={(e) => handleExpressionChange(question.id, e.target.value)}
                          />
                          <Form.Text className="text-muted">Définissez l'expression pour ce type de question.</Form.Text>
                        </Form.Group>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="rounded-pill shadow-sm font-weight-bold"
            disabled={loadingFormula || !formData.formId || Object.keys(formData.expression).length === 0}
          >
            {loadingFormula ? 'Chargement...' : (editingFormulaId ? 'Enregistrer les Modifications' : 'Ajouter la Formule')}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateFormula; 
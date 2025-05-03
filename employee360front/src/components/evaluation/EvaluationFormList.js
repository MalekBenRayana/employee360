import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaCalendarAlt, FaQuestion, FaEye } from 'react-icons/fa';
import '../../assets/styles/evaluation-form-list.css';
import Navbar from '../Navbar';
import { LayoutContext } from '../../contexts/LayoutContext';
import { fetchForms, deleteForm } from '../../services/evaluationFormService';

const EvaluationFormList = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { collapsed } = useContext(LayoutContext);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadForms = async () => {
            try {
                const data = await fetchForms();
                setForms(data);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors de la récupération des formulaires.');
                setLoading(false);
                console.error('Erreur de récupération des formulaires:', err);
            }
        };

        loadForms();
    }, []);

    const handleDelete = (id) => {
        setDeleteConfirmation(id);
    };

    const confirmDelete = async (id) => {
        setIsDeleting(true);
        try {
            await deleteForm(id);
            setForms(forms.filter(form => form.id !== id));
            setDeleteConfirmation(null);
        } catch (err) {
            setError('Erreur lors de la suppression du formulaire.');
            console.error('Erreur de suppression du formulaire:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className="container-fluid py-5 loading-container">
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                        <p className="mt-2 text-muted">Chargement des formulaires...</p>
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
                <div className="container-fluid py-5 evaluation-form-list-container-pro">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="display-6 text-primary font-weight-bold">
                            <FaFileAlt className="me-2" /> Gestion des Formulaires
                        </h2>
                        <Link to="/evaluation-forms/create" className="btn btn-primary btn-lg rounded-pill shadow-sm font-weight-bold">
                            <FaPlus className="me-2" /> Nouveau Formulaire
                        </Link>
                    </div>
                    <p className="lead text-secondary mb-4">Explorez, modifiez et organisez vos modèles d'évaluation.</p>

                    {forms.length > 0 ? (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {forms.map(form => (
                                <div key={form.id} className="col">
                                    <div className="card card-form shadow-lg rounded-3 border-0 h-100">
                                        <div className="card-body card-body-pro d-flex flex-column">
                                            <h5 className="card-title font-weight-bold text-primary mb-2">{form.name}</h5>
                                            <div className="d-flex align-items-center text-muted mb-1">
                                                <FaCalendarAlt className="me-2" /> Créé le {form.createdAt && formatDate(form.createdAt)}
                                            </div>
                                            {form.form_structure && form.form_structure.questions && (
                                                <div className="d-flex align-items-center text-muted mb-2">
                                                    <FaQuestion className="me-2" /> {form.form_structure.questions.length} Questions
                                                </div>
                                            )}
                                            <div className="mt-auto d-flex justify-content-end">
                                                <Link to={`/evaluation-forms/edit/${form.id}`} className="btn btn-outline-primary rounded-pill me-2 shadow-sm">
                                                    <FaEdit className="me-2" /> Modifier
                                                </Link>
                                                <Link to={`/evaluation-forms/${form.id}/responses`} className="btn btn-outline-info rounded-pill me-2 shadow-sm" title="Voir les Réponses">
                                                    <FaEye className="me-2" /> Réponses
                                                </Link>
                                                <button
                                                    className="btn btn-outline-danger rounded-pill shadow-sm"
                                                    onClick={() => handleDelete(form.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <FaTrash className="me-2" /> Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {deleteConfirmation === form.id && (
                                        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                            <div className="modal-dialog modal-dialog-centered">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title">Confirmation de suppression</h5>
                                                        <button type="button" className="btn-close" onClick={cancelDelete} aria-label="Close"></button>
                                                    </div>
                                                    <div className="modal-body">
                                                        Êtes-vous sûr de vouloir supprimer le formulaire "{form.name}" ?
                                                    </div>
                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-secondary rounded-pill shadow-sm" onClick={cancelDelete}>Annuler</button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger rounded-pill shadow-sm"
                                                            onClick={() => confirmDelete(form.id)}
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-info shadow-sm">Aucun formulaire n'a été créé pour le moment. Commencez par en créer un nouveau.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationFormList;
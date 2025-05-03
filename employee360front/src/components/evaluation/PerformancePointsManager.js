import React, { useEffect, useState, useContext } from 'react';
import { LayoutContext } from '../../contexts/LayoutContext';
import Navbar from '../Navbar';
import { Card, Button, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './../../assets/styles/performance-points-manager.css';
import CreatePerformancePointType from './CreatePerformancePointType';

import {
    getAll,
    getById,
    update,
    remove,
    create,
} from '../../services/performancePointTypeService';

const PerformancePointsManager = () => {
    const { collapsed } = useContext(LayoutContext);
    const [types, setTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        weight: 1,
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAll();
            console.log("Réponse complète de getAll():", res);
            setTypes(res);
        } catch (err) {
            setError(err.message || 'Failed to fetch performance point types.');
            toast.error(err.message || 'Erreur de chargement des types de points de performance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleCreate = async (newFormData) => {
        try {
            const createdData = await create(newFormData);
            if (createdData && createdData.data) {
                toast.success("Type de point créé avec succès.");
                await fetchTypes();
                setShowCreateForm(false);
            }
        } catch (error) {
            toast.error(error.message || "Une erreur s'est produite lors de la création.");
            setError(error.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (formData.name.trim() === '' || isNaN(formData.weight)) {
            toast.error("Veuillez remplir tous les champs correctement.");
            return;
        }

        try {
            const updatedData = await update(editingId, formData);
            if (updatedData && updatedData.data) {
                toast.success("Type de point mis à jour avec succès.");
                setEditingId(null);
                setFormData({ name: '', weight: 1, description: '' });
                await fetchTypes();
                setShowCreateForm(false);
            }
        } catch (error) {
            toast.error(error.message || "Une erreur s'est produite lors de la mise à jour.");
            setError(error.message);
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getById(id);
            if (res && res.data) {
                setFormData(res.data);
                setEditingId(id);
                setShowCreateForm(true);
            }
        } catch (error) {
            toast.error(error.message || "Erreur lors de la récupération des détails du type de point.");
            setError(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type de point ?")) {
            try {
                await remove(id);
                toast.success("Type de point supprimé avec succès.");
                await fetchTypes();
            } catch (error) {
                toast.error(error.message || "Erreur lors de la suppression du type de point.");
                setError(error.message);
            }
        }
    };

    const handleCancelCreateForm = () => {
        setShowCreateForm(false);
        setEditingId(null);
        setFormData({ name: '', weight: 1, description: '' });
    };

    if (loading) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                    <div className={`${styles.container} ${styles.loadingContainer}`}>
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                        <p className="mt-2 text-muted">Chargement des types de points de performance...</p>
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
                    <div className={`${styles.container} ${styles.errorMessage} alert alert-danger shadow-sm`}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className={`${styles.container} container-fluid py-5`}>
                    {!showCreateForm && (
                        <div className="mb-4">
                            <h2 className="display-4 text-primary font-weight-bold mt-3">Gestion des Types des Points de performance</h2>
                            <p className="lead text-secondary">Ajoutez, modifiez ou supprimez les types de points de performance.</p>
                            <Button variant="primary" className="rounded-pill shadow-sm font-weight-bold" onClick={() => setShowCreateForm(true)}>
                                Créer un Nouveau Type de Point
                            </Button>
                        </div>
                    )}

                    {showCreateForm && (
                        <CreatePerformancePointType
                            initialFormData={formData}
                            editingId={editingId}
                            onCreate={handleCreate}
                            onUpdate={handleUpdate}
                            onCancel={handleCancelCreateForm}
                        />
                    )}

                    {!showCreateForm && (
                        <div className="mt-5">
                            <h3 className="display-6 text-primary font-weight-semibold mb-3">Liste des Types des Points de performance</h3>
                            {types.length > 0 ? (
                                <Card className="shadow-lg rounded-3 border-0">
                                    <Card.Body className="p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Nom</th>
                                                        <th>Poids</th>
                                                        <th>Description</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {types.map((type) => (
                                                        <tr key={type.id}>
                                                            <td>{type.name}</td>
                                                            <td>{type.weight}</td>
                                                            <td>{type.description}</td>
                                                            <td>
                                                                <Button variant="outline-primary" size="sm" onClick={() => handleEdit(type.id)} className="me-2 rounded-pill shadow-sm">
                                                                    <FaEdit />
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(type.id)} className="rounded-pill shadow-sm">
                                                                    <FaTrash />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <Alert variant="info">Aucun point de performance trouvé.</Alert>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformancePointsManager;
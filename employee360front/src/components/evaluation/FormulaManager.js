
import React, { useEffect, useState, useContext } from 'react';
import { LayoutContext } from '../../contexts/LayoutContext';
import Navbar from '../Navbar';
import { Card, Button, Table, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from '../../assets/styles/formula-manager.css';
import CreateFormula from './CreateFormula';
import {
    getAllFormulas,
    deleteFormula,
} from '../../services/formulaService';

const FormulaManager = () => {
    const { collapsed } = useContext(LayoutContext);
    const [formulas, setFormulas] = useState([]);
    const [editingFormulaId, setEditingFormulaId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formulaToEdit, setFormulaToEdit] = useState(null);

    const fetchFormulas = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllFormulas();
            setFormulas(data);
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération des formules.');
            toast.error(err.message || 'Erreur lors de la récupération des formules.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFormulas();
    }, []);

    const handleCreateClick = () => {
        setEditingFormulaId(null);
        setFormulaToEdit(null);
        setShowCreateForm(true);
    };

    const handleEdit = async (id) => {
        setEditingFormulaId(id);
        setShowCreateForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formule ?")) {
            try {
                await deleteFormula(id);
                toast.success("Formule supprimée avec succès.");
                await fetchFormulas();
            } catch (err) {
                toast.error(err.message || 'Erreur lors de la suppression de la formule.');
            }
        }
    };

    const handleSaveFormula = async (formulaData) => {
        await fetchFormulas();
        setShowCreateForm(false);
        setEditingFormulaId(null);
        setFormulaToEdit(null);
    };

    const handleCancelForm = () => {
        setShowCreateForm(false);
        setEditingFormulaId(null);
        setFormulaToEdit(null);
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className={`${styles.container} container-fluid py-5`}>
                    <div className="mb-4 d-flex justify-content-between align-items-center">
                        <h2 className="display-4 text-primary font-weight-bold mt-3">Gestion des Formules</h2>
                        <Button variant="primary" className="rounded-pill shadow-sm font-weight-bold" onClick={handleCreateClick}>
                            <FaPlus className="me-2" /> Ajouter une Formule
                        </Button>
                    </div>

                    {showCreateForm && (
                        <CreateFormula
                            onSave={handleSaveFormula}
                            onCancel={handleCancelForm}
                            editingFormulaId={editingFormulaId}
                        />
                    )}

                    {!showCreateForm && (
                        <Card className="shadow-lg rounded-3 border-0">
                            <Card.Body className="p-4">
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Formulaire</th>
                                                <th>Expressions</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formulas.map(formula => (
                                                <tr key={formula.id}>
                                                    <td>{formula.id}</td>
                                                    <td>{formula.form?.name || 'N/A'}</td>
                                                    <td>
                                                        {formula.expression && Object.keys(formula.expression).map(key => (
                                                            <div key={key}>
                                                                <strong>{key}:</strong> {formula.expression[key]}
                                                            </div>
                                                        ))}
                                                        {!formula.expression || Object.keys(formula.expression).length === 0 ? 'N/A' : null}
                                                    </td>
                                                    <td>
                                                        <Button variant="outline-primary" size="sm" className="me-2 rounded-pill shadow-sm" onClick={() => handleEdit(formula.id)}>
                                                            <FaEdit />
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill shadow-sm" onClick={() => handleDelete(formula.id)}>
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {formulas.length === 0 && !loading && !showCreateForm && (
                        <Alert variant="info" className="mt-3">Aucune formule trouvée. Cliquez sur "Ajouter une Formule" pour en créer une.</Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormulaManager;
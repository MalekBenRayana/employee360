import React, { useState, useEffect } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

const CreatePerformancePointType = ({ initialFormData, editingId, onCreate, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        weight: 1,
        description: '',
    });

    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);
        }
    }, [initialFormData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = value;
        if (name === 'weight') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                parsedValue = numValue;
            }
        }
        setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name.trim() === '' || isNaN(formData.weight)) {
            toast.error("Veuillez remplir tous les champs correctement.");
            return;
        }

        if (editingId) {
            if (onUpdate) {
                onUpdate(e); // Le composant parent gère la mise à jour
            }
        } else {
            if (onCreate) {
                onCreate(formData); // Le composant parent gère la création
            }
        }
    };

    return (
        <Card className="shadow-lg rounded-3 border-0">
            <Card.Body className="p-4">
                <div className="mb-4">
                    <Button variant="outline-secondary" className="rounded-pill me-2 shadow-sm" onClick={onCancel}>
                        <FaArrowLeft className="me-2" /> Retour
                    </Button>
                    <h2 className="display-4 text-primary font-weight-bold mt-3">{editingId ? 'Modifier le Type de Point de performance' : 'Créer un Nouveau Type de Point de performance'}</h2>
                    <p className="lead text-secondary">{editingId ? 'Modifiez les informations du type de point.' : 'Entrez les détails du nouveau type de point.'}</p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">Nom:</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Entrez le nom du type de point"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">Poids:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                name="weight"
                                step="0.1"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                                placeholder="Entrez le poids du type de point"
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">Description:</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="Entrez la description du type de point"
                        />
                    </Form.Group>
                    <Button type="submit" className="rounded-pill shadow-sm font-weight-bold">
                        {editingId ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CreatePerformancePointType;
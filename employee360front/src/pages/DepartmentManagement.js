import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { HiPencilAlt, HiTrash, HiEye, HiOfficeBuilding, HiPlusCircle } from 'react-icons/hi';
import { OverlayTrigger, Tooltip, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DepartmentModal from '../components/modals/DepartmentModal';
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';
import { motion } from 'framer-motion';
import { useSpring } from 'react-spring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3000/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des départements', error);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleViewDepartmentDetails = (id) => {
        navigate(`/department-details/${id}`);
    };

    const handleAddDepartment = () => {
        setShowDepartmentModal(true);
        setSelectedDepartment(null);
    };

    const handleEditDepartment = (department) => {
        setSelectedDepartment(department);
        setShowEditDepartmentModal(true);
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/departments/${id}`);
            setDepartments(departments.filter((department) => department.department_id !== id));
        } catch (error) {
            console.error(`Erreur lors de la suppression du département ${id}`, error);
        }
    };

    const refreshDepartments = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3000/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des départements après modification', error);
        }
    }, []);

    const titleAnimation = useSpring({
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { mass: 1, tension: 170, friction: 26 },
    });

    const chartData = [{ name: 'Départements', value: departments.length }];

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <motion.div style={titleAnimation} className="mb-4">
                        <h2 className="text-primary fw-bold">Gestion des Départements</h2>
                    </motion.div>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Départements</h6>
                                        <h4 className="mb-0 fw-bold text-info">{departments.length}</h4>
                                    </div>
                                    <HiOfficeBuilding size={32} className="text-info" />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Liste des Départements</h5>
                                <Button variant="success" onClick={handleAddDepartment} className="btn-sm">
                                    <HiPlusCircle className="me-1" /> Ajouter Département
                                </Button>
                            </div>
                            {loadingDepartments ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Nom</th>
                                                <th>Responsable</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {departments.map((department) => (
                                                <motion.tr
                                                    key={department.department_id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td>{department.department_name}</td>
                                                    <td>{department.department_head?.username || 'Non attribué'}</td>
                                                    <td className="text-end">
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
                                                            <Button
                                                                variant="outline-warning"
                                                                onClick={() => handleEditDepartment(department)}
                                                                className="btn-sm rounded-circle me-2"
                                                            >
                                                                <HiPencilAlt size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                                                            <Button
                                                                variant="outline-danger"
                                                                onClick={() => handleDeleteDepartment(department.department_id)}
                                                                className="btn-sm rounded-circle me-2"
                                                            >
                                                                <HiTrash size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Consulter</Tooltip>}>
                                                            <Button
                                                                variant="outline-info"
                                                                onClick={() => handleViewDepartmentDetails(department.department_id)}
                                                                className="btn-sm rounded-circle"
                                                            >
                                                                <HiEye size={18} />
                                                            </Button>
                                                        </OverlayTrigger>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>


                    <DepartmentModal
                        show={showDepartmentModal}
                        handleClose={() => setShowDepartmentModal(false)}
                        department={selectedDepartment}
                        refreshDepartments={refreshDepartments}
                    />

                    {selectedDepartment && (
                        <DepartmentModal
                            show={showEditDepartmentModal}
                            handleClose={() => setShowEditDepartmentModal(false)}
                            department={selectedDepartment}
                            refreshDepartments={refreshDepartments}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentManagement;
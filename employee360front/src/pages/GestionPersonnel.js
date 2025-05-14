import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminDashboardService from '../../src/services/adminDashboardService';
import { HiEye, HiUser } from 'react-icons/hi';
import { OverlayTrigger, Tooltip, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import { LayoutContext } from '../contexts/LayoutContext';
import { motion } from 'framer-motion';
import { useSpring } from 'react-spring';

function GestionPersonnel() {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const { collapsed } = useContext(LayoutContext);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const allEmployees = await adminDashboardService.getTotalEmployeesWithDetails();
            setEmployees(allEmployees);
            setSearchResults(allEmployees);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleViewEmployeeDetails = (id) => {
        navigate(`/employees/${id}/stats`);
    };

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        const filteredEmployees = employees.filter(employee =>
            employee.username?.toLowerCase().includes(query.toLowerCase()) ||
            employee.email?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredEmployees);
    };

    const titleAnimation = useSpring({
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { mass: 1, tension: 170, friction: 26 },
    });

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <motion.div style={titleAnimation} className="mb-4">
                        <h2 className="text-primary fw-bold">Gestion du Personnel</h2>
                    </motion.div>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Employés</h6>
                                        <h4 className="mb-0 fw-bold text-info">{employees.length}</h4>
                                    </div>
                                    <HiUser size={32} className="text-info" />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="mb-3">
                                <label htmlFor="searchEmployee" className="form-label">Rechercher par nom d'utilisateur ou email:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="searchEmployee"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            {loading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : error ? (
                                <Alert variant="danger">{`Erreur lors du chargement des employés: ${error}`}</Alert>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Nom d'utilisateur</th>
                                                <th>Email</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResults.map((employee) => (
                                                <motion.tr
                                                    key={employee.id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td>{employee.username}</td>
                                                    <td>{employee.email}</td>
                                                    <td className="text-end">
                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Consulter l'historique</Tooltip>}>
                                                            <Button
                                                                variant="outline-info"
                                                                onClick={() => handleViewEmployeeDetails(employee.id)}
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
                </div>
            </div>
        </div>
    );
}

export default GestionPersonnel;
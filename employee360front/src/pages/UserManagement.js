import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { getUsers, deleteUser, getUserById, updateUser, reactivateUser, deactivateUser } from '../services/userService';
import {
    Button, Table, Spinner, OverlayTrigger, Tooltip, Alert, Card, Row, Col, Form, InputGroup, FormControl
} from 'react-bootstrap';
import EditModal from '../components/modals/EditModal';
import InviteModal from '../components/modals/InviteModal';
import { HiPencilAlt, HiTrash, HiSwitchHorizontal, HiUserAdd, HiUserGroup, HiSearch } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import '../assets/styles/layout.css';
import '../assets/styles/UserManagement.css';
import { LayoutContext } from '../contexts/LayoutContext';
import { motion } from 'framer-motion';
import { useSpring } from 'react-spring';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import Select from 'react-select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { collapsed } = useContext(LayoutContext);
    const roles = useMemo(() => ['admin', 'employee', 'manager'], []);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Erreur lors de la récupération des utilisateurs, veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = useCallback(async (userId) => {
        try {
            await deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError('Erreur lors de la suppression de l\'utilisateur, veuillez réessayer plus tard.');
        }
    }, [users]);

    const handleEditUser = useCallback(async (userId) => {
        try {
            const user = await getUserById(userId);
            setCurrentUser(user);
            setShowModal(true);
        } catch (err) {
            setError('Erreur lors de la récupération de l\'utilisateur, veuillez réessayer plus tard.');
        }
    }, []);

    const handleSaveUser = async (updatedUser) => {
        try {
            await updateUser(updatedUser.id, updatedUser);
            setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
            setShowModal(false);
        } catch (err) {
            setError('Erreur lors de la mise à jour de l\'utilisateur, veuillez réessayer plus tard.');
        }
    };

    const handleInviteUser = () => {
        setShowInviteModal(true);
    };

    const handleCloseInviteModal = () => {
        setShowInviteModal(false);
    };

    const handleToggleUserStatus = async (userId, isActive) => {
        try {
            const response = isActive
                ? await deactivateUser(userId)
                : await reactivateUser(userId);

            if (response && response.isActive !== undefined) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isActive: response.isActive } : user
                    )
                );
            } else {
                setError('Erreur lors de la modification de l\'état de l\'utilisateur, veuillez réessayer plus tard.');
            }
        } catch (err) {
            setError('Erreur réseau ou serveur');
        }
    };

    const titleAnimation = useSpring({
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { mass: 1, tension: 170, friction: 26 },
    });

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = searchTerm
                ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            const roleMatch = roleFilter
                ? user.roles && user.roles.some(role => role.name === roleFilter.value)
                : true;

            const statusMatch = statusFilter
                ? (statusFilter.value === 'actif' && user.isActive) || (statusFilter.value === 'inactif' && !user.isActive)
                : true;

            return searchMatch && roleMatch && statusMatch;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const roleCounts = useMemo(() => {
        return filteredUsers.reduce((acc, user) => {
            if (user.roles && Array.isArray(user.roles)) {
                user.roles.forEach(role => {
                    acc[role.name] = (acc[role.name] || 0) + 1;
                });
            } else {
                acc['Aucun rôle'] = (acc['Aucun rôle'] || 0) + 1;
            }
            return acc;
        }, {});
    }, [filteredUsers]);

    const pieChartData = useMemo(() => Object.entries(roleCounts).map(([name, value]) => ({ name, value })), [roleCounts]);


    const statusCounts = useMemo(() => {
        return filteredUsers.reduce((acc, user) => {
            acc[user.isActive ? 'Actif' : 'Inactif'] = (acc[user.isActive ? 'Actif' : 'Inactif'] || 0) + 1;
            return acc;
        }, {});
    }, [filteredUsers]);

    const statusChartData = useMemo(() => Object.entries(statusCounts).map(([name, value]) => ({ name, value })), [statusCounts]);

    const roleOptions = useMemo(() => roles.map(role => ({ value: role, label: role })), [roles]);
    const statusOptions = useMemo(() => [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' },
    ], []);

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid mt-4">
                    <motion.div style={titleAnimation} className="mb-4">
                        <h2 className="text-primary fw-bold">Gestion des Utilisateurs</h2>
                    </motion.div>

                    <Row className="mb-3">
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Utilisateurs</h6>
                                        <h4 className="mb-0 fw-bold text-info">{users.length}</h4>
                                    </div>
                                    <HiUserGroup size={32} className="text-info" />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Utilisateurs Actifs</h6>
                                        <h4 className="mb-0 fw-bold text-success">{statusCounts['Actif'] || 0}</h4>
                                    </div>
                                    <span className="text-success" style={{ fontSize: '2em' }}>●</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm border-0 rounded-lg">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Utilisateurs Inactifs</h6>
                                        <h4 className="mb-0 fw-bold text-warning">{statusCounts['Inactif'] || 0}</h4>
                                    </div>
                                    <span className="text-warning" style={{ fontSize: '2em' }}>●</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="d-flex align-items-center justify-content-end">
                            <Button variant="success" onClick={handleInviteUser} className="btn-sm">
                                <HiUserAdd className="me-1" /> Ajouter un utilisateur
                            </Button>
                        </Col>
                    </Row>

                    <Card className="shadow-sm mb-4">
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3">
                                <InputGroup>
                                    <FormControl
                                        type="text"
                                        placeholder="Rechercher par nom ou email"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <InputGroup.Text><HiSearch /></InputGroup.Text>
                                </InputGroup>
                            </div>
                            <div className="me-3" style={{ width: '200px' }}>
                                <Select
                                    isClearable
                                    placeholder="Filtrer par rôle"
                                    options={roleOptions}
                                    value={roleFilter}
                                    onChange={setRoleFilter}
                                />
                            </div>
                            <div style={{ width: '180px' }}>
                                <Select
                                    isClearable
                                    placeholder="Filtrer par statut"
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={8}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <h5 className="card-title mb-3">Liste des Utilisateurs</h5>
                                    {loading ? (
                                        <div className="text-center">
                                            <Spinner animation="border" variant="primary" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="danger">{error}</Alert>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table striped bordered hover responsive className="align-middle">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Nom</th>
                                                        <th>Email</th>
                                                        <th>Rôle(s)</th>
                                                        <th>Statut</th>
                                                        <th className="text-end">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredUsers.map(user => (
                                                        <motion.tr
                                                            key={user.id}
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className={!user.isActive ? 'text-muted' : ''}
                                                        >
                                                            <td>{user.username}</td>
                                                            <td>{user.email}</td>
                                                            <td>
                                                                {Array.isArray(user.roles) && user.roles.length > 0
                                                                    ? user.roles.map(role => role.name).join(', ')
                                                                    : 'Aucun rôle'}
                                                            </td>
                                                            <td>{user.isActive ? 'Actif' : 'Inactif'}</td>
                                                            <td className="text-end">
                                                                <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
                                                                    <Button variant="outline-warning" onClick={() => handleEditUser(user.id)} className="mr-2 p-2 rounded-circle btn-sm"><HiPencilAlt size={18} /></Button>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                                                                    <Button variant="outline-danger" onClick={() => handleDeleteUser(user.id)} className="mr-2 p-2 rounded-circle btn-sm"><HiTrash size={18} /></Button>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip>{user.isActive ? 'Désactiver' : 'Activer'}</Tooltip>}>
                                                                    <Button variant={user.isActive ? "outline-secondary" : "outline-success"} onClick={() => handleToggleUserStatus(user.id, user.isActive)} className="mr-2 p-2 rounded-circle btn-sm"><HiSwitchHorizontal size={18} /></Button>
                                                                </OverlayTrigger>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Row className="mb-4">
                                {pieChartData.length > 0 && (
                                    <Col md={12}>
                                        <Card className="shadow-sm">
                                            <Card.Body>
                                                <h6 className="card-title mb-3 fw-bold text-primary">Répartition des Rôles</h6>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <PieChart>
                                                        <Pie
                                                            data={pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={80}
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {pieChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                                        <ChartTooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )}
                            </Row>
                           
                        </Col>
                    </Row>

                    <InviteModal
                        showModal={showInviteModal}
                        setShowModal={handleCloseInviteModal}
                        fetchUsers={fetchUsers}
                        handleInviteUser={handleInviteUser}
                    />

                    {currentUser && (
                        <EditModal
                            showModal={showModal}
                            setShowModal={setShowModal}
                            user={currentUser}
                            handleSaveUser={handleSaveUser}
                            roles={roles}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
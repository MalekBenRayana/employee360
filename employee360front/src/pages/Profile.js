import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaUser, FaEnvelope, FaUserTag, FaKey, FaShieldAlt, FaProjectDiagram, FaInfoCircle, FaCog } from 'react-icons/fa';
import axios from '../axios';
import EditPasswordModal from '../components/modals/EditPasswordModal';
import { Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import '../assets/styles/profile.css';
import '../assets/styles/layout.css';
import { LayoutContext } from '../contexts/LayoutContext';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const [projects, setProjects] = useState([]);
    const { collapsed } = useContext(LayoutContext);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(response.data);
            setProjects(response.data.projects);
        } catch (error) {
            setError('Impossible de récupérer le profil');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    return (
        <div className="app-layout">
            <Navbar />
            <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
                <div className="container-fluid py-5">
                    <div className="text-center mb-5">
                        <h2 className="display-4 text-primary font-weight-bold mb-3">
                            <FaUser className="me-2" /> Profil de {profile ? profile.username : 'Chargement...'}
                        </h2>
                        <p className="lead text-secondary">Gérez vos informations personnelles et la sécurité de votre compte.</p>
                    </div>

                    {error && <div className="alert alert-danger shadow-sm">{error}</div>}

                    {profile ? (
                        <div className="row">
                            <div className="col-md-8 mb-4">
                                <div className="card shadow-lg rounded-3 border-0">
                                    <div className="card-body p-4">
                                        <h5 className="card-title font-weight-bold text-muted mb-4"><FaInfoCircle className="me-2" /> Informations Personnelles</h5>
                                        <div className="mb-3 d-flex align-items-center">
                                            <FaUser size={20} className="me-3 text-primary" />
                                            <span className="font-weight-bold">Nom d'utilisateur:</span>
                                            <span className="ms-2 text-secondary">{profile.username}</span>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <FaEnvelope size={20} className="me-3 text-success" />
                                            <span className="font-weight-bold">Email:</span>
                                            <span className="ms-2 text-secondary">{profile.email}</span>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <FaUserTag size={20} className="me-3 text-warning" />
                                            <span className="font-weight-bold">Rôles:</span>
                                            <span className="ms-2 text-secondary">{profile.roles?.join(", ")}</span>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>

                            <div className="col-md-4">
                                <div className="card shadow-lg rounded-3 border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="card-title font-weight-bold text-muted mb-4"><FaShieldAlt className="me-2" /> Permissions</h5>
                                        <ul className="list-unstyled">
                                            {profile.permissions?.map((permission, index) => (
                                                <li key={index} className="mb-2 d-flex align-items-center">
                                                    <FaKey size={16} className="me-2 text-info" />
                                                    <span className="text-secondary">{permission}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="card shadow-lg rounded-3 border-0">
                                    <div className="card-body p-4">
                                        <h5 className="card-title font-weight-bold text-muted mb-4"><FaCog className="me-2" /> Actions</h5>
                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="warning"
                                                onClick={() => setShowModal(true)}
                                                className="py-2 font-weight-bold rounded-pill shadow-sm transition-all duration-300 hover:shadow-md"
                                            >
                                                <FaKey className="me-2" /> Changer le mot de passe
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2 text-muted">Chargement des informations du profil...</p>
                        </div>
                    )}

                    <EditPasswordModal
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        profile={profile}
                        token={token}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
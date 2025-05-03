import React, { useState, useContext } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { useAuth } from "../auth/AuthContext";
 import {
  FaUserAlt, FaSignOutAlt, FaCog,
  FaCaretDown, FaBars, FaFileAlt, FaTasks, FaBuilding, FaListAlt, FaPencilAlt
 } from 'react-icons/fa';
 import NotificationListener from './NotificationListener';
 import { LayoutContext } from '../contexts/LayoutContext';
 import ProxymLogo from '../assets/images/Logo-Proxym.png';
 import { FaList } from 'react-icons/fa';

 const Navbar = () => {
  const { role, userId, logout } = useAuth();
  const { collapsed, toggleSidebar } = useContext(LayoutContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [evaluationsOpen, setEvaluationsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleProfileDropdown = () => setProfileOpen(prev => !prev);
  const toggleEvaluationsDropdown = () => setEvaluationsOpen(prev => !prev);

  const handleDashboardNavigation = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "employee" && userId) {
              navigate("/employee-dashboard");
    } else if (role === "manager") {
      navigate("/manager-dashboard");
    } else {
      console.warn("Rôle non reconnu ou ID utilisateur non disponible pour la navigation vers le tableau de bord.");
    }
  };

  const isEvaluationsMenuVisible = role === "admin" || role === "employee" || role === "manager";

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <FaBars onClick={toggleSidebar} style={{ cursor: 'pointer', marginBottom: '10px' }} />
        <div className="logo-wrapper">
          {!collapsed && (
            <img src={ProxymLogo} alt="Proxym Logo" className="sidebar-logo" />
          )}
        </div>
      </div>

      <ul className="sidebar-menu">
        <li onClick={handleDashboardNavigation} style={{ cursor: 'pointer' }}>
          <FaUserAlt />
          {!collapsed && <span>Dashboard</span>}
        </li>


        <li className={`submenu ${profileOpen ? "open" : ""}`}>
          <div onClick={toggleProfileDropdown}>
            <FaUserAlt />
            {!collapsed && <span>Mon Profil</span>}
            {!collapsed && <FaCaretDown className="dropdown-icon" />}
          </div>
          {profileOpen && !collapsed && (
            <ul className="submenu-items">
              <li><Link to="/profile">Mes Informations</Link></li>
              <li><Link to="/user-projects">Mes Projets</Link></li>
            </ul>
          )}
        </li>

        <li>
          <NotificationListener />
        </li>

        {isEvaluationsMenuVisible && (
          <li className={`submenu ${evaluationsOpen ? "open" : ""}`}>
            <div onClick={toggleEvaluationsDropdown}>
              <FaFileAlt />
              {!collapsed && <span>Évaluations</span>}
              {!collapsed && <FaCaretDown className="dropdown-icon" />}
            </div>
            {evaluationsOpen && !collapsed && (
              <ul className="submenu-items">
                {role === "admin" && (
                  <>
                    <li><Link to="/evaluation-forms">Gestion des Formulaires </Link></li>
                    <li><Link to="/evaluation-sessions">Gestion des Sessions</Link></li>
                    <li><Link to="/performance-points">Gestion des Points</Link></li>
                    <li><Link to="/formules">Gestion des Formules</Link></li>
                  </>
                )}

              </ul>
            )}
          </li>
        )}

        {role === "admin" && (
          <>
            <li>
              <Link to="/project-management">
                <FaTasks />
                {!collapsed && <span>Gestion des Projets</span>}
              </Link>
            </li>
            <li>
              <Link to="/department-management">
                <FaBuilding />
                {!collapsed && <span>Gestion des Départements</span>}
              </Link>
            </li>
            <li>
              <Link to="/admin/users-management">
                <FaCog />
                {!collapsed && <span>Gestion des utilisateurs</span>}
              </Link>
            </li>
          </>
        )}

        <li className="logout-item" onClick={logout}>
          <div className="logout-content">
            <FaSignOutAlt />
            {!collapsed && <span className="sidebar-label">Déconnexion</span>}
          </div>
        </li>
      </ul>
    </div>
  );
 };

 export default Navbar;
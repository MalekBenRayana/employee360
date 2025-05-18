import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';
import styles from '../assets/styles/Login.module.css';
import { Form, Button } from 'react-bootstrap';
import logo from '../assets/images/Logo-Proxym.png';
import backgroundImage from '../assets/images/img.jpg';

import { loginUser, fetchUserRole } from "../services/authService";

const Login = () => {
  const { setToken, setRole, setUserId, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await loginUser(email, password);

      if (token) {
        localStorage.setItem('access_token', token);
        setToken(token);

        const roleData = await fetchUserRole(token);

        if (roleData?.roles?.length > 0) {
          const userRole = roleData.roles[0];
          const userIdFromData = roleData.id;
          

          setRole(userRole);
          setUserId(userIdFromData);
          localStorage.setItem('user_role', userRole);
          localStorage.setItem('user_id', userIdFromData);

          switch (userRole) {
            case 'admin':
              navigate("/admin-dashboard", { replace: true });
              break;
            case 'manager':
              navigate("/manager-dashboard", { replace: true });
              break;
            case 'employee':
              navigate("/employee-dashboard", { replace: true });
              break;
            default:
              console.error("Rôle inconnu");
          }
        }
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Proxym Logo" className={styles.logo} />
        </div>
        <Form onSubmit={handleSubmit} className={styles.loginForm}>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              type="email"
              placeholder="Entrez votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Control
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </Form.Group>

          <div className={styles.rememberForgotPassword}>
            <Form.Check
              type="checkbox"
              label="Se souvenir de moi"
              className={styles.rememberMe}
            />
            <a href="/register" className={styles.forgotPassword}>
              Pas encore un compte ?
            </a>
          </div>

          <Button type="submit" className={styles.loginButton}>
            Se connecter
          </Button>

          {error && (
            <div className={styles.error}>
              <small>{error}</small>
            </div>
          )}
        </Form>
      </div>
      <div className={styles.background}>
        <img src={backgroundImage} alt="Fond Bleu" className={styles.backgroundImage} />
      </div>
    </div>
  );
};

export default Login;
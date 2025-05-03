import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';
import styles from '../assets/styles/Login.module.css';
import { Card, Form, Button } from 'react-bootstrap';

import { loginUser, fetchUserRole } from "../services/authService";

const Login = () => {
  const { setToken, setRole, error } = useAuth();
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
          setRole(userRole);
          localStorage.setItem('user_role', userRole);

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
    <div className={styles.container}>
      <Card className={styles.card}>
        <Card.Body className={styles.cardBody}>
          <h2 className={styles.heading}>Connexion</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.label}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </Form.Group>

            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.label}>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </Form.Group>

            <Button type="submit" className={styles.button}>
              Se connecter
            </Button>
          </Form>

          {error && (
            <div className={styles.error}>
              <small>{error}</small>
            </div>
          )}

          <div className={styles.authSwitch}>
            <small>
              Pas encore de compte ?{" "}
              <a href="/register" className={styles.authLink}>
                Inscrivez-vous ici
              </a>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;

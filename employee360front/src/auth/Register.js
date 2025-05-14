import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../assets/styles/Login.module.css';
import { Form, Button } from 'react-bootstrap';
import logo from '../assets/images/Logo-Proxym.png';
import backgroundImage from '../assets/images/img.jpg';
import { registerUser } from "../services/authService";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      username,
      email,
      password,
    };

    try {
      await registerUser(formData);
      console.log("Inscription réussie !");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error.message || error);
      alert(error.message || "Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Proxym Logo" className={styles.logo} />
          <h2 className={styles.formTitle}>Inscription</h2>
        </div>
        <Form onSubmit={handleSubmit} className={styles.loginForm}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.label}>Nom d'utilisateur</Form.Label>
            <Form.Control
              type="text"
              placeholder="Choisissez un nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.label}>Adresse e-mail</Form.Label>
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
            <Form.Label className={styles.label}>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Créez un mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </Form.Group>

          <Button type="submit" className={styles.loginButton}>S'inscrire</Button>

          <div className={styles.authSwitch}>
            <small>
              Déjà un compte ?{" "}
              <a href="/login" className={styles.authLink}>
                Connectez-vous ici
              </a>
            </small>
          </div>
        </Form>
      </div>
      <div className={styles.background}>
        <img src={backgroundImage} alt="Fond Bleu" className={styles.backgroundImage} />
      </div>
    </div>
  );
};

export default Register;
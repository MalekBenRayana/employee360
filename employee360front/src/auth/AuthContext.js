import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserRole, logout as logoutService } from "../services/authService";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [role, setRole] = useState(localStorage.getItem("user_role") || null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && (!role || !userId)) {
      const fetchAndSetUserInfo = async () => {
        try {
          const data = await fetchUserRole(token);

          if (data && data.roles && data.roles.length > 0) {
            const userRole = data.roles[0];
            const id = data.id;

            setRole(userRole);
            setUserId(id);

            localStorage.setItem("user_role", userRole);
            localStorage.setItem("user_id", id);
          } else {
            console.error("Aucun rôle trouvé dans la réponse");
            setError("Rôle de l'utilisateur introuvable");
            handleLogout();
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des infos utilisateur", error);
          setError("Erreur lors de la récupération des infos utilisateur");
          handleLogout();
        } finally {
          setLoading(false);
        }
      };

      fetchAndSetUserInfo();
    } else {
      setLoading(false);
    }
  }, [token, role, userId]);

  const handleLogout = () => {
    logoutService();
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      role,
      userId,
      loading,
      error,
      setToken,
      setRole,
      setUserId,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;

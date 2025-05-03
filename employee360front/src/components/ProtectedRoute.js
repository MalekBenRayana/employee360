import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const { token, role, loading } = useAuth() || {};

  if (loading) {
    return <p>Chargement...</p>; 
  }

  if (!token || (roleRequired && role !== roleRequired)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const { token, role, loading } = useAuth() || {};
  const location = useLocation();

  console.log("ProtectedRoute - Loading:", loading);
  console.log("ProtectedRoute - Token:", token);
  console.log("ProtectedRoute - Role:", role);
  console.log("ProtectedRoute - Role Required:", roleRequired);
  console.log("ProtectedRoute - Location:", location.pathname);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!token || (roleRequired && role !== roleRequired)) {
    console.log("ProtectedRoute - Redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
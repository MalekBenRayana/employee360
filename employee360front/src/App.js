import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Register from "./auth/Register";
import Login from "./auth/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./auth/AuthContext";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProjectDetails from "./pages/ProjectDetails";
import DepartmentDetails from "./pages/DepartmentDetails";
import UserProjects from "./pages/UserProjects";
import EvaluationFormList from "./components/evaluation/EvaluationFormList";
import EvaluationFormCreator from "./components/evaluation/EvaluationFormCreator";
import EvaluationResponseList from "./components/evaluation/EvaluationResponseList";
import EvaluationResponseDetail from "./components/evaluation/EvaluationResponseDetail";
import EvaluationFormResponder from "./components/evaluation/EvaluationFormResponder";
import EvaluationSessionCreator from "./components/evaluation/EvaluationSessionCreator";
import EvaluationSessionsManager from "./components/evaluation/EvaluationSessionsManager";
import PerformancePointsManager from "./components/evaluation/PerformancePointsManager"; // Importez PerformancePointsManager


import { NotificationProvider } from "./contexts/NotificationContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import ProjectManagement from "./pages/ProjectManagement";
import DepartmentManagement from "./pages/DepartmentManagement";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormulaManager from './components/evaluation/FormulaManager';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LayoutProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-projects"
              element={
                <ProtectedRoute>
                  <UserProjects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roleRequired="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users-management"
              element={
                <ProtectedRoute roleRequired="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
<Route
  path="/employee-dashboard"
  element={
    <ProtectedRoute roleRequired="employee">
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute roleRequired="manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-management"
              element={
                <ProtectedRoute roleRequired="admin">
                  <ProjectManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-management"
              element={
                <ProtectedRoute roleRequired="admin">
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/project-details/:projectId"
              element={
                <ProtectedRoute roleRequired="admin">
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-details/:departmentId"
              element={
                <ProtectedRoute roleRequired="admin">
                  <DepartmentDetails />
                </ProtectedRoute>
              }
            />

            {/* Routes pour la gestion des formulaires d'évaluation */}
            <Route
              path="/evaluation-forms"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationFormList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluation-forms/create"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationFormCreator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluation-forms/edit/:id"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationFormCreator />
                </ProtectedRoute>
              }
            />

            <Route
              path="/evaluation-forms/:formId/responses"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationResponseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluation-responses/:responseId"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationResponseDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/respond/:formId"
              element={
                <ProtectedRoute>
                  <EvaluationFormResponder />
                </ProtectedRoute>
              }
            />

            <Route
              path="/evaluation-sessions/create"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationSessionCreator />
                </ProtectedRoute>
              }
            />

            {/* Route pour la gestion des sessions d'évaluation */}
            <Route
              path="/evaluation-sessions"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EvaluationSessionsManager />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/performance-points"
              element={
                <ProtectedRoute>
                  <PerformancePointsManager/>
                </ProtectedRoute>
              }
            />

        <Route 
              path="/formules"
              element={
                <ProtectedRoute>
                  <FormulaManager/>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />

        </LayoutProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import PerformancePointsManager from "./components/evaluation/PerformancePointsManager";
import AssignedEvaluationsView from "./components/evaluation/AssignedEvaluationsView";
import SelfEvaluationView from "./components/evaluation/SelfEvaluationView";

import { NotificationProvider } from "./contexts/NotificationContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import ProjectManagement from "./pages/ProjectManagement";
import DepartmentManagement from "./pages/DepartmentManagement";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormulaManager from './components/evaluation/FormulaManager';
import GestionPersonnel from './pages/GestionPersonnel';
import EmployeeHistory from './components/EmployeeHistory';
import DeplacementsAdmin from "./components/time-tracking-admin/Deplacements";
import AutorisationsRetardAdmin from "./components/time-tracking-admin/AutorisationsRetard";
import CongesAdmin from "./components/time-tracking-admin/Conges";
import SuiviRetardsEmployee from "./components/time-tracking-employee/SuiviRetards";
import CongesEmployee from "./components/time-tracking-employee/CongesEmp";
import DeplacementsEmployee from "./components/time-tracking-employee/DeplacementsEmp";
import AppHeader from './components/AppHeader';
import ManagerProjectDetails from "./pages/ManagerProjectDetails"; // Importez le nouveau composant
import TasksTrackingAdmin from './components/tasks-tracking-admin/TasksTrakingAdmin';
import TasksTrackingEmployee from './components/tasks-tracking-employee/TasksTrackingEmployee'; // Importez le nouveau composant
import TimeTrackingManager from './components/time-traking-manager/TimeTrackingManager';
import TaskTrackingManager from './components/tasks-traking-manager/TaskTrackingManager';

const App = () => {
  const location = useLocation();
  const shouldShowHeader = location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/reset-password';

  return (
    <AuthProvider>
      <NotificationProvider>
        <LayoutProvider>
          {shouldShowHeader && <AppHeader />}

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
              path="/gestion-personnel"
              element={
                <ProtectedRoute roleRequired="admin">
                  <GestionPersonnel />
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
              path="/assigned-evaluations"
              element={
                <ProtectedRoute roleRequired="employee">
                  <AssignedEvaluationsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/self-evaluation"
              element={
                <ProtectedRoute roleRequired="employee">
                  <SelfEvaluationView />
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

            {/* Utilisez ManagerProjectDetails pour les détails des projets pour les managers */}
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute roleRequired="manager">
                  <ManagerProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/project-details/:projectId"
              element={
                <ProtectedRoute roleRequired="admin">
                  <ProjectDetails /> {/* Vous pouvez toujours garder cette route pour les admins */}
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

            <Route
              path="/employees/:id/stats"
              element={
                <ProtectedRoute roleRequired="admin">
                  <EmployeeHistory />
                </ProtectedRoute>
              }
            />


            <Route
              path="/admin/tasks"
              element={<ProtectedRoute roleRequired="admin"><TasksTrackingAdmin /></ProtectedRoute>} />

            <Route
              path="/employee/tasks"
              element={<ProtectedRoute roleRequired="employee"><TasksTrackingEmployee /></ProtectedRoute>} /> {/* Ajout de la route pour l'employé */}

            <Route
              path="/admin/retards"
              element={<ProtectedRoute roleRequired="admin"><AutorisationsRetardAdmin /></ProtectedRoute>} />
            <Route path="/admin/conges" element={<ProtectedRoute roleRequired="admin"><CongesAdmin /></ProtectedRoute>} />
            <Route path="/admin/deplacements" element={<ProtectedRoute roleRequired="admin"><DeplacementsAdmin /></ProtectedRoute>} />

            <Route
              path="/employee/retards"
              element={<ProtectedRoute roleRequired="employee"><SuiviRetardsEmployee /></ProtectedRoute>} />
            <Route
              path="/employee/conges"
              element={<ProtectedRoute roleRequired="employee"><CongesEmployee /></ProtectedRoute>} />
            <Route
              path="/employee/deplacements"
              element={<ProtectedRoute roleRequired="employee"><DeplacementsEmployee /></ProtectedRoute>} />

              <Route
              path="/manager/time-tracking"
              element={<ProtectedRoute roleRequired="manager"><TimeTrackingManager /></ProtectedRoute>} />

              <Route
              path="/manager/task-tracking"
              element={<ProtectedRoute roleRequired="manager"><TaskTrackingManager /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </LayoutProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
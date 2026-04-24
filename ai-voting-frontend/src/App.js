import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import VotePage from './pages/VotePage';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ReportPage from './pages/ReportPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Página inicial */}
          <Route path="/" element={<HomePage />} />

          {/* Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Rotas Públicas de Participação */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />

          {/* Administração protegida */}
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsersPage /></AdminRoute>
          } />
          <Route path="/admin/report" element={
            <AdminRoute><ReportPage /></AdminRoute>
          } />
          <Route path="/analytics" element={
            <AdminRoute><AdminAnalyticsPage /></AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

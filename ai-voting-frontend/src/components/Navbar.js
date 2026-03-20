import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        ⚡ AI<span>Vote</span>
      </Link>

      {/* Nav links */}
      <div className="navbar-nav">
        {isAdmin && (
          <>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              👥 Usuários
            </NavLink>
            <NavLink to="/admin/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: '#0866ff' }}>
              📄 Relatório
            </NavLink>
          </>
        )}

        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/vote" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              🗳️ Votar
            </NavLink>
            <NavLink to="/questionnaire" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              📋 Questionário
            </NavLink>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '0 4px' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Entrar
            </NavLink>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

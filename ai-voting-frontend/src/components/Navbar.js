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
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🏠 Início
        </NavLink>
        <NavLink to="/vote" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🗳️ Votar
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📊 Dashboard
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-divider" />
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              👥 Usuários
            </NavLink>
            <NavLink to="/admin/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: '#0866ff' }}>
              📄 Relatório
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem', marginLeft: '12px' }} onClick={handleLogout}>
            Sair
          </button>
        )}
        
        <button 
          className="btn btn-ghost" 
          style={{ padding: '8px 12px', fontSize: '1rem', color: 'var(--accent)', opacity: 0.8 }} 
          onClick={() => window.location.reload()}
          title="Recarregar Site"
        >
          🔄
        </button>
      </div>
    </nav>
  );
}

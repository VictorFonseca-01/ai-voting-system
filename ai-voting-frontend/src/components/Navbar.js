import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o painel ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Polling de notificações (apenas para Admin)
  useEffect(() => {
    if (!isAdmin) return;

    const checkVotes = async () => {
      try {
        const { data: d } = await dashboardAPI.getData();
        const recent = d.recentVotes || [];
        
        if (recent.length > 0) {
          const lastSeenId = parseInt(localStorage.getItem('lastSeenVoteId') || '0');
          const latestId = Math.max(...recent.map(v => v.id || 0));
          
          if (latestId > lastSeenId) {
            setHasNew(true);
          }
          setNotifications(recent.slice(0, 5)); // Mostra os 5 mais recentes
        }
      } catch (err) {
        console.error("Erro ao checar notificações", err);
      }
    };

    checkVotes();
    const interval = setInterval(checkVotes, 20000); // Checa a cada 20s
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleOpenNotifications = () => {
    setShowPanel(!showPanel);
    if (!showPanel && notifications.length > 0) {
      const latestId = Math.max(...notifications.map(v => v.id || 0));
      localStorage.setItem('lastSeenVoteId', latestId.toString());
      setHasNew(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
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

            {/* Sino de Notificações */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
              <button 
                className="btn btn-ghost" 
                style={{ padding: '8px', fontSize: '1.2rem', position: 'relative', marginLeft: '10px' }}
                onClick={handleOpenNotifications}
                title="Notificações"
              >
                🔔
                {hasNew && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '10px',
                    height: '10px',
                    background: '#ff4d6d',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-body)',
                    boxShadow: '0 0 8px rgba(255, 77, 109, 0.5)'
                  }} />
                )}
              </button>

              {showPanel && (
                <div className="card fade-up" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  marginTop: '12px',
                  zIndex: 1000,
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Últimas Atividades</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} recentes</span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>Nenhuma atividade nova.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map((n, i) => (
                        <div key={i} style={{ 
                          padding: '10px', 
                          background: 'rgba(255,255,255,0.03)', 
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          borderLeft: '3px solid var(--accent)'
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: '2px', cursor: 'pointer', color: 'var(--accent)' }} onClick={() => { navigate('/dashboard'); setShowPanel(false); }}>
                            {n.userName}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                            {n.userCourse}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ opacity: 0.6 }}>Votou em:</span>
                            <span style={{ fontWeight: 600 }}>{n.aiName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', textAlign: 'center' }}>
                    <Link to="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }} onClick={() => setShowPanel(false)}>
                      Ver Dashboard Completo
                    </Link>
                  </div>
                </div>
              )}
            </div>
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

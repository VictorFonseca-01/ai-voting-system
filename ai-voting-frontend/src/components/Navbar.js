import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import AIIcon from './AIIcon.jsx';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
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

  const groupedNotifications = useMemo(() => {
    const groups = {};
    notifications.forEach(n => {
      const key = `${n.userName}-${n.userCourse}`;
      if (!groups[key]) {
        groups[key] = { ...n, aiNames: [n.aiName] };
      } else {
        if (!groups[key].aiNames.includes(n.aiName)) {
          groups[key].aiNames.push(n.aiName);
        }
      }
    });
    return Object.values(groups).slice(0, 5);
  }, [notifications]);

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

      {/* Nav links (scrollable on mobile) */}
      <div className="navbar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🏠 Início
        </NavLink>
        <NavLink to="/vote" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🗳️ Votar
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📊 Dashboard Geral
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
      </div>

      {/* Action buttons — ALWAYS visible, never inside the scrollable area */}
      <div className="navbar-actions" ref={dropdownRef} style={{ 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'flex-end',
        gap: '8px',
        flexShrink: 0
      }}>
        {isAdmin && (
          <button 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)',
              fontSize: '1.2rem', position: 'relative', padding: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={handleOpenNotifications}
            title="Notificações"
          >
            🔔
            {hasNew && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px',
                background: '#ff4d6d', borderRadius: '50%', border: '1px solid var(--bg)'
              }} />
            )}
          </button>
        )}

        {isAuthenticated && (
          <button 
            style={{ 
              background: 'none', border: '1px solid rgba(255,77,109,0.3)', cursor: 'pointer', 
              color: '#ff8fa3', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem',
              fontWeight: 600, whiteSpace: 'nowrap'
            }} 
            onClick={handleLogout}
          >
            🚪 Sair
          </button>
        )}
        
        <button 
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', 
            padding: '6px', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} 
          onClick={() => window.location.reload()}
          title="Recarregar"
        >
          🔄
        </button>
      </div>

      {/* ─── PAINEL DE NOTIFICAÇÕES (fixed overlay) ─── */}
      {isAdmin && showPanel && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowPanel(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }} 
          />
          <div className="card fade-up" style={{
            position: 'fixed',
            top: '60px',
            right: '12px',
            width: 'min(340px, calc(100vw - 24px))',
            maxHeight: 'min(480px, calc(100vh - 80px))',
            overflowY: 'auto',
            zIndex: 1001,
            padding: '20px',
            background: '#0d0d12',
            boxShadow: '0 10px 50px rgba(0,0,0,0.7), 0 0 0 1px var(--border)',
            border: '1px solid var(--accent)',
            borderRadius: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>🔔 Últimas Atividades</h4>
              <button 
                onClick={() => setShowPanel(false)} 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: 'var(--text-muted)', fontSize: '1.4rem', padding: '4px 8px',
                  lineHeight: 1, minWidth: '36px', minHeight: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 10px' }}>Nenhuma atividade nova.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {groupedNotifications.map((n, i) => (
                  <div key={i} style={{ 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    borderLeft: '3px solid var(--accent)'
                  }}>
                    <Link 
                      to={`/admin/users?search=${encodeURIComponent(n.userName)}`} 
                      onClick={() => setShowPanel(false)} 
                      style={{ textDecoration: 'none', fontWeight: 700, marginBottom: '3px', display: 'block', color: 'var(--accent)' }}
                    >
                      {n.userName}
                    </Link>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '8px' }}>
                      {n.userCourse}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {n.aiNames.map(name => <AIIcon key={name} name={name} size={16} />)}
                      </div>
                      <span style={{ opacity: 0.9, fontWeight: 500 }}>
                        votou em: <strong>{n.aiNames.join(' e ')}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', textAlign: 'center' }}>
              <Link to="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }} onClick={() => setShowPanel(false)}>
                Ver Dashboard Completo →
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

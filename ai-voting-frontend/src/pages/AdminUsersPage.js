import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Backend proxies /api via nginx or assumes full URL
        const response = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        setError('Erro ao carregar usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (loading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div className="page fade-up">
      <div className="card" style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 style={{ marginBottom: '24px' }}>👥 Usuários Cadastrados</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Nome</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Votou?</th>
                <th style={{ padding: '12px' }}>Questionário?</th>
                <th style={{ padding: '12px' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {u.name}
                    {u.role === 'ROLE_ADMIN' && <span className="badge badge-accent" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>ADMIN</span>}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>{u.hasVoted ? '✅ Sim' : '⏳ Não'}</td>
                  <td style={{ padding: '12px' }}>{u.hasAnswered ? '✅ Sim' : '⏳ Não'}</td>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

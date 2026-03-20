import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, type: 'confirm' });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (user) => {
    setModalConfig({
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir o usuário "${user.name}"? Todos os seus votos e respostas também serão apagados!`,
      onConfirm: () => confirmDelete(user.id),
      type: 'confirm'
    });
    setShowModal(true);
  };

  const confirmDelete = async (userId) => {
    setShowModal(false);
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      setModalConfig({
        title: 'Erro',
        message: err.response?.data?.error || 'Não foi possível excluir o usuário.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div className="page fade-up">
      {/* Modal Customizado */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="accent-line" style={{ width: '40px', marginBottom: '8px' }} />
              <h3>{modalConfig.title}</h3>
            </div>
            <div className="modal-body">
              {modalConfig.message}
            </div>
            <div className="modal-footer">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={modalConfig.onConfirm} style={{ background: '#cc0000' }}>Excluir</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Entendido</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '1100px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>👥 Usuários Cadastrados</h2>
          <button onClick={() => window.history.back()} className="btn btn-ghost">Voltar</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Nome</th>
                <th style={{ padding: '12px' }}>Curso</th>
                <th style={{ padding: '12px' }}>Votou?</th>
                <th style={{ padding: '12px' }}>Questionário?</th>
                <th style={{ padding: '12px' }}>Ações</th>
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
                  <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{u.course || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{u.hasVoted ? '✅ Sim' : '⏳ Não'}</td>
                  <td style={{ padding: '12px' }}>{u.hasAnswered ? '✅ Sim' : '⏳ Não'}</td>
                  <td style={{ padding: '12px' }}>
                    {u.email !== 'admin@aivoting.com' && (
                      <button 
                        onClick={() => handleDeleteUser(u)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#ff4d6d', padding: '4px' }}
                        title="Excluir Usuário"
                      >
                         🗑️
                      </button>
                    )}
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

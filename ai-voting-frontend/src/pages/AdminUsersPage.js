import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

// --- DEBOUNCE HOOK ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminUsersPage() {
  // --- STATE: DATA ---
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE: CONTROLS (Query Params) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [sort, setSort] = useState({ column: 'name', ascending: true });
  const debouncedSearch = useDebounce(search, 500);

  // --- STATE: SELECTION & EDITING ---
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // --- STATE: MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, type: 'confirm' });

  // --- FETCH DATA ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, totalCount } = await adminAPI.getUsers({
        page,
        pageSize,
        search: debouncedSearch,
        filters,
        sort
      });
      setUsers(data);
      setTotalCount(totalCount);
    } catch (err) {
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- HANDLERS: QUERY ---
  const handleSort = (column) => {
    setSort(prev => ({
      column,
      ascending: prev.column === column ? !prev.ascending : true
    }));
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // --- HANDLERS: ACTIONS ---
  const toggleSelectAll = () => {
    if (selectedIds.size === users.length && users.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleDeleteBatch = () => {
    if (selectedIds.size === 0) return;
    setModalConfig({
      title: 'Excluir em Lote',
      message: `Deseja excluir os ${selectedIds.size} usuários selecionados? Esta ação é irreversível e removerá todos os votos associados. O Administrador será preservado automaticamente.`,
      onConfirm: confirmDeleteBatch,
      type: 'confirm'
    });
    setShowModal(true);
  };

  const confirmDeleteBatch = async () => {
    setShowModal(false);
    setBatchActionLoading(true);
    try {
      await adminAPI.deleteUsers(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err) {
      setError('Falha ao excluir usuários em lote.');
    } finally {
      setBatchActionLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditData({ name: user.name, course: user.course });
  };

  const saveEdit = async (userId) => {
    try {
      await adminAPI.updateUser(userId, editData);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert('Erro ao salvar alterações.');
    }
  };

  const handleDeleteSingle = (user) => {
    setModalConfig({
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir "${user.name}"?`,
      onConfirm: async () => {
        setShowModal(false);
        try {
          await adminAPI.deleteUser(user.id);
          fetchUsers();
        } catch (err) {
          alert(err.message || 'Erro ao excluir.');
        }
      },
      type: 'confirm'
    });
    setShowModal(true);
  };

  // --- RENDER HELPERS ---
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page fade-up" style={{ padding: '20px' }}>
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="accent-line" style={{ width: '40px', marginBottom: '8px' }} />
              <h3>{modalConfig.title}</h3>
            </div>
            <p className="modal-body">{modalConfig.message}</p>
            <div className="modal-footer">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={modalConfig.onConfirm}>Confirmar</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span> Gestão de Usuários
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Controle total de participantes e permissões do sistema.
            </p>
          </div>
          <button onClick={() => window.history.back()} className="btn btn-ghost">← Voltar para Dashboard</button>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="saas-toolbar" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', 
          padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Buscar Usuário</label>
            <input 
              type="text" 
              placeholder="Nome, email ou curso..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ width: '100%', background: '#0a0a1a' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nível de Acesso</label>
            <select className="form-control" value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} style={{ width: '100%', background: '#0a0a1a' }}>
              <option value="">Todos os Níveis</option>
              <option value="ROLE_ADMIN">Administradores</option>
              <option value="ROLE_USER">Usuários Comuns</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Status de Atividade</label>
            <select className="form-control" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ width: '100%', background: '#0a0a1a', paddingRight: '30px' }}>
              <option value="">Todos os Status</option>
              <option value="voted">Já Votaram</option>
              <option value="not_voted">Não Votaram</option>
              <option value="answered">Questionário Concluído</option>
              <option value="not_answered">Questionário Pendente</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Itens por Página</label>
            <select className="form-control" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: '100%', background: '#0a0a1a' }}>
              <option value={10}>10 Usuários</option>
              <option value={20}>20 Usuários</option>
              <option value={50}>50 Usuários</option>
            </select>
          </div>
        </div>

        {/* --- MASS ACTIONS BAR --- */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: 'rgba(217, 70, 239, 0.1)', padding: '12px 20px', 
                borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(217, 70, 239, 0.2)'
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d946ef' }}>
                ⚡ {selectedIds.size} {selectedIds.size === 1 ? 'usuário selecionado' : 'usuários selecionados'}
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setSelectedIds(new Set())} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Desmarcar</button>
                <button className="btn btn-danger" onClick={handleDeleteBatch} disabled={batchActionLoading} style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  {batchActionLoading ? 'Excluindo...' : 'Excluir em Lote'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- TABLE --- */}
        <div className="saas-table-container" style={{ overflowX: 'auto', minHeight: '300px' }}>
          <table className="saas-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={toggleSelectAll} />
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nome {sort.column === 'name' && (sort.ascending ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('course')} style={{ cursor: 'pointer' }} className="hide-mobile">
                  Curso {sort.column === 'course' && (sort.ascending ? '↑' : '↓')}
                </th>
                <th style={{ textAlign: 'center' }}>Votou?</th>
                <th style={{ textAlign: 'center' }} className="hide-tablet">Quest?</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Nenhum usuário encontrado com estes critérios.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={selectedIds.has(u.id) ? 'row-selected' : ''}>
                  <td>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelectUser(u.id)} />
                  </td>
                  <td>
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{u.name || 'Participante'}</span>
                        {u.role === 'ROLE_ADMIN' && <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>ADMIN</span>}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.email && !u.email.includes('guest_') && !u.email.includes('test_') && !u.email.includes('anon_') ? u.email : ''}
                    </div>
                  </td>
                  <td className="hide-mobile">
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.course} 
                        onChange={e => setEditData({...editData, course: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                      />
                    ) : (
                      u.course || '-'
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: u.hasVoted ? 'var(--success)' : 'var(--text-muted)' }}>{u.hasVoted ? '● Sim' : '○ Não'}</span>
                  </td>
                  <td style={{ textAlign: 'center' }} className="hide-tablet">
                    <span style={{ color: u.hasAnswered ? 'var(--success)' : 'var(--text-muted)' }}>{u.hasAnswered ? '● Sim' : '○ Não'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {editingId === u.id ? (
                        <>
                          <button className="btn-icon" onClick={() => saveEdit(u.id)} title="Salvar">💾</button>
                          <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancelar">✕</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => startEditing(u)} title="Editar">✏️</button>
                          {u.role !== 'ROLE_ADMIN' && <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteSingle(u)} title="Excluir">🗑️</button>}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginTop: '24px', padding: '20px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Exibindo <strong>{totalCount > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, totalCount)}</strong> de <strong>{totalCount}</strong> usuários
          </div>
          <div className="pagination">
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px' }}>Anterior</button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <button 
                  key={i} 
                  className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => setPage(i + 1)}
                  style={{ minWidth: '36px', height: '36px', padding: '0', borderRadius: '8px' }}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 5 && <span style={{ padding: '8px' }}>...</span>}
            </div>
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ padding: '6px 12px' }}>Próxima</button>
          </div>
        </div>
      </div>
      
      {/* Estilos Inline SaaS */}
      <style>{`
        .saas-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .saas-table th { padding: 12px 16px; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
        .saas-table td { padding: 16px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .saas-table td:first-child { border-left: 1px solid rgba(255,255,255,0.05); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .saas-table td:last-child { border-right: 1px solid rgba(255,255,255,0.05); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .saas-table tr:hover td { background: rgba(255,255,255,0.04); }
        .row-selected td { background: rgba(217, 70, 239, 0.05) !important; border-color: rgba(217, 70, 239, 0.2) !important; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: 0.2s; }
        .btn-icon:hover { background: rgba(255,255,255,0.1); }
        .btn-icon-danger:hover { background: rgba(255, 77, 109, 0.2); }
        .pagination { display: flex; gap: 8px; align-items: center; }
        .badge-accent { background: rgba(217, 70, 239, 0.15); color: #d946ef; padding: 2px 8px; border-radius: 4px; font-weight: 800; }
        .btn-danger { background: #ff4d6d; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .saas-toolbar { grid-template-columns: 1fr !important; }
          .pagination button { padding: 4px 8px !important; font-size: 0.8rem; }
        }
        @media (max-width: 1024px) {
          .hide-tablet { display: none; }
        }
      `}</style>
    </div>
  );
}

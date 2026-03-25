import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { getInstagramUrl } from '../utils/socialUtils';

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
  const [filters, setFilters] = useState({ 
    role: '', 
    status: '', 
    is_complete: 'true' // Default: apenas participações válidas
  });
  const [sort, setSort] = useState({ column: 'name', ascending: true });
  const debouncedSearch = useDebounce(search, 300);

  // --- STATE: SELECTION & EDITING ---
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // --- STATE: MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, type: 'confirm' });
  
  // --- STATE: ADD USER ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({ name: '', course: '', institution: '' });
  const [addLoading, setAddLoading] = useState(false);

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
  
  // --- SYNC WITH URL SEARCH ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

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
    setEditData({ name: user.name, course: user.course, institution: user.institution, instagram: user.instagram });
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newData.name) return alert('O nome é obrigatório');
    setAddLoading(true);
    try {
      await adminAPI.createUser(newData);
      setShowAddModal(false);
      setNewData({ name: '', course: '', institution: '' });
      fetchUsers();
    } catch (err) {
      alert('Erro ao criar usuário.');
    } finally {
      setAddLoading(false);
    }
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => window.history.back()} className="btn btn-ghost">← Voltar</button>
          </div>
        </div>



        {/* --- TOOLBAR --- */}
        <div className="saas-toolbar" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', marginBottom: '24px', background: 'transparent', 
          padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'none'
        }}>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Buscar Usuário</label>
            <input 
              type="text" 
              placeholder="Nome, email ou curso..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Status de Registro</label>
            <select 
              className="form-control" 
              value={filters.is_complete} 
              onChange={e => setFilters({...filters, is_complete: e.target.value})}
              style={{ width: '100%' }}
            >
              <option value="true">✅ Completos</option>
              <option value="false">⏳ Incompletos</option>
              <option value="">👥 Todos os Registros</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nível de Acesso</label>
            <select className="form-control" value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} style={{ width: '100%' }}>
              <option value="">Todos os Níveis</option>
              <option value="ROLE_ADMIN">Administradores</option>
              <option value="ROLE_USER">Usuários Comuns</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Status de Atividade</label>
            <select className="form-control" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ width: '100%', paddingRight: '30px' }}>
              <option value="">Todos os Status</option>
              <option value="voted">Já Votaram</option>
              <option value="not_voted">Não Votaram</option>
              <option value="answered">Questionário Concluído</option>
              <option value="not_answered">Questionário Pendente</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Itens por Página</label>
            <select className="form-control" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: '100%' }}>
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
        <div className="saas-table-container" style={{ 
          overflowX: 'auto', 
          minHeight: '300px', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <table className="saas-table-flat" style={{ tableLayout: 'fixed', minWidth: '1100px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={toggleSelectAll} />
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', width: '220px' }}>
                  Participante {sort.column === 'name' && (sort.ascending ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('course')} style={{ cursor: 'pointer', width: '200px' }}>
                  Curso {sort.column === 'course' && (sort.ascending ? '↑' : '↓')}
                </th>
                <th style={{ width: '180px' }}>Instituição</th>
                <th style={{ textAlign: 'center', width: '70px' }}>Insta</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Votou?</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Quest?</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '100px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Nenhum usuário encontrado com estes critérios.</td></tr>
              ) : users.map((u, index) => (
                <tr key={u.id} className={selectedIds.has(u.id) ? 'row-selected' : ''}>
                  {/* 1. ID/Index */}
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700 }}>
                    {(page - 1) * pageSize + index + 1}
                  </td>

                  {/* 2. Checkbox */}
                  <td>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelectUser(u.id)} />
                  </td>

                  {/* 3. Nome */}
                  <td>
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.name || ''} 
                        onChange={e => setEditData({...editData, name: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div className="text-truncate" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            background: u.is_complete ? '#10b981' : '#6b7280',
                            flexShrink: 0 
                          }} title={u.is_complete ? 'Completo' : 'Incompleto'} />
                          {u.name || 'Participante'}
                          {u.role === 'ROLE_ADMIN' && <span className="badge badge-accent" style={{ fontSize: '0.6rem', marginLeft: '6px' }}>ADMIN</span>}
                        </div>
                        {u.email && !u.email.includes('guest_') && !u.email.includes('test_') && !u.email.includes('anon_') && (
                          <div className="text-truncate" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.email}</div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* 4. Curso */}
                  <td>
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.course || ''} 
                        onChange={e => setEditData({...editData, course: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        placeholder="Curso"
                      />
                    ) : (
                      <div className="text-truncate">{u.course || '-'}</div>
                    )}
                  </td>

                  {/* 5. Instituição */}
                  <td>
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.institution || ''} 
                        onChange={e => setEditData({...editData, institution: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        placeholder="Instituição"
                      />
                    ) : (
                      <div className="text-truncate">{u.institution || '-'}</div>
                    )}
                  </td>

                  {/* 6. Insta */}
                  <td style={{ textAlign: 'center' }}>
                    {editingId === u.id ? (
                      <input 
                        className="form-control" 
                        value={editData.instagram || ''} 
                        onChange={e => setEditData({...editData, instagram: e.target.value})} 
                        style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        placeholder="@username"
                      />
                    ) : u.instagram ? (
                      <a 
                        href={getInstagramUrl(u.instagram)} 
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#e1306c', display: 'flex', justifyContent: 'center', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.281.11-.705.24-1.485.276-.844.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                        </svg>
                      </a>
                    ) : '-'}
                  </td>

                  {/* 7. Votou? */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: u.hasVoted ? 'var(--success)' : 'var(--text-muted)' }}>{u.hasVoted ? '● Sim' : '○ Não'}</span>
                  </td>

                  {/* 8. Quest? */}
                  <td style={{ textAlign: 'center' }} className="hide-tablet">
                    <span style={{ color: u.hasAnswered ? 'var(--success)' : 'var(--text-muted)' }}>{u.hasAnswered ? '● Sim' : '○ Não'}</span>
                  </td>

                  {/* 9. Ações */}
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
        .saas-table-container { 
          scrollbar-width: thin; 
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .saas-table-container::-webkit-scrollbar { height: 6px; }
        .saas-table-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .saas-table-flat { width: 100%; border-collapse: collapse !important; border-spacing: 0 !important; margin-top: 0; background: transparent !important; }
        .saas-table-flat th { 
          padding: 16px; 
          color: var(--accent-light); 
          font-size: 0.65rem; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          border-bottom: 2px solid rgba(255,255,255,0.05); 
          text-align: left; 
          background: rgba(255,255,255,0.02) !important;
          font-weight: 800;
        }
        .saas-table-flat tr { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s; }
        .saas-table-flat td { 
          padding: 14px 16px; 
          background: transparent !important; 
          box-shadow: none !important; 
          color: #fff; 
          vertical-align: middle;
          font-size: 0.9rem;
        }
        .saas-table-flat tr:hover { background: rgba(255,255,255,0.03) !important; }
        .row-selected { background: rgba(217, 70, 239, 0.05) !important; }
        
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          display: block;
        }

        .btn-icon { background: transparent !important; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: 0.2s; box-shadow: none !important; }
        .btn-icon:hover { background: rgba(255,255,255,0.1); }
        .btn-icon-danger:hover { background: rgba(255, 77, 109, 0.2); }
        .pagination { display: flex; gap: 8px; align-items: center; }
        .badge-accent { background: rgba(217, 70, 239, 0.15); color: #d946ef; padding: 2px 8px; border-radius: 4px; font-weight: 800; }
        .btn-danger { background: #ff4d6d; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        
        @media (max-width: 768px) {
          .saas-toolbar { grid-template-columns: 1fr !important; }
          .pagination { width: 100%; justify-content: space-between; margin-top: 10px; }
          .pagination button { padding: 4px 8px !important; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}

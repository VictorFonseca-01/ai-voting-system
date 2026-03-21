import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI, adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// Registra os componentes do Chart.js
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// Paleta de cores para os gráficos
// Paleta de cores vibrantes e modernas
const PALETTE = ['#6366f1', '#10b981', '#f43f5e', '#fbbf24', '#06b6d4', '#8b5cf6', '#d946ef'];

const SYSTEM_URL = window.location.origin;

// Variantes de animação para Framer Motion
const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// BackgroundOrbs removido conforme solicitado ("sem as ondas")

export default function DashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, type: 'confirm' });
  const [newPass, setNewPass] = useState('');

  const fetchData = async () => {
    try {
      const { data: d } = await dashboardAPI.getData();
      setData(d);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    setModalConfig({
      title: 'Zerar Todos os Dados',
      message: 'ATENÇÃO: Isso apagará TODOS os votos, respostas e usuários (exceto o admin). Esta ação não pode ser desfeita. Deseja continuar?',
      onConfirm: confirmReset,
      type: 'confirm'
    });
    setShowModal(true);
  };

  const confirmReset = async () => {
    setShowModal(false);
    try {
      await adminAPI.resetData();
      setModalConfig({
        title: 'Sucesso',
        message: 'O sistema foi reiniciado com sucesso.',
        type: 'alert'
      });
      setShowModal(true);
      fetchData(); // Recarrega os dados (que estarão zerados)
    } catch (err) {
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível zerar os dados.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };

  const handleChangePassword = () => {
    setModalConfig({
      title: 'Alterar Minha Senha',
      type: 'password'
    });
    setNewPass('');
    setShowModal(true);
  };

  const confirmChangePassword = async () => {
    if (newPass.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setShowModal(false);
    try {
      await adminAPI.changePassword(newPass);
      setModalConfig({
        title: 'Sucesso',
        message: 'Sua senha foi alterada com sucesso.',
        type: 'alert'
      });
      setShowModal(true);
    } catch (err) {
      setModalConfig({
        title: 'Erro',
        message: err.response?.data?.error || 'Não foi possível alterar a senha.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };
  
  const handleResetMyVotes = () => {
    setModalConfig({
      title: 'Refazer Meus Votos',
      message: 'Isso apagará apenas os SEUS votos para que você possa votar novamente. Deseja continuar?',
      onConfirm: confirmResetMyVotes,
      type: 'confirm'
    });
    setShowModal(true);
  };

  const confirmResetMyVotes = async () => {
    setShowModal(false);
    try {
      await adminAPI.resetMyAdminVotes();
      setModalConfig({
        title: 'Sucesso',
        message: 'Seus votos foram removidos. Redirecionando para a página de votação...',
        type: 'alert'
      });
      setShowModal(true);
      setTimeout(() => {
        window.location.href = '/vote';
      }, 2000);
    } catch (err) {
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível remover seus votos.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: backup } = await adminAPI.exportData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_aivoting_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao exportar backup.');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setModalConfig({
      title: 'Restaurar Backup',
      message: `ATENÇÃO: Isso apagará TODOS os dados atuais do Localhost e substituirá pelos dados do arquivo "${file.name}". Deseja continuar?`,
      onConfirm: () => confirmImport(file),
      type: 'confirm'
    });
    setShowModal(true);
  };

  const confirmImport = async (file) => {
    setShowModal(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        await adminAPI.importData(backup);
        setModalConfig({
          title: 'Sucesso! 🚀',
          message: 'Banco de dados restaurado com sucesso! Recarregando...',
          type: 'alert'
        });
        setShowModal(true);
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        setModalConfig({
          title: 'Erro na Restauração',
          message: err.response?.data?.error || 'Arquivo de backup inválido ou erro no servidor.',
          type: 'alert'
        });
        setShowModal(true);
      }
    };
    reader.readAsText(file);
  };

  if (loading || authLoading) return <div className="page"><div className="spinner" /></div>;

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px' }}>Erro ao carregar</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Dados de votos por IA
  const votesByAi     = data?.votesByAi     || {};
  const totalVotes    = data?.totalVotes     || 0;
  const totalResponses= data?.totalResponses || 0;
  const useForStudy   = data?.useForStudy    || 0;
  const useForWork    = data?.useForWork     || 0;
  const workAreas     = data?.workAreas      || {};
  const whereUseAi    = data?.whereUseAi     || {};
  const whyUseAi      = data?.whyUseAi       || {};
  const recentVotes   = data?.recentVotes    || [];

  // Ranking de IAs
  const aiRanking = Object.entries(votesByAi)
    .sort((a, b) => b[1] - a[1]);

  // Se NÃO for Admin, mostra a versão SIMPLIFICADA (PREMIUM)
  if (!isAdmin) {
    return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial="hidden" animate="visible" variants={fUp}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <motion.div 
              style={{ width: '60px', height: '4px', background: 'var(--grad-vibrant)', borderRadius: '2px', margin: '0 auto 20px' }}
              animate={{ width: [40, 80, 40] }} transition={{ duration: 4, repeat: Infinity }}
            />
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 800 }}>
              Resumo da Pesquisa
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              Descubra como a comunidade está moldando o futuro com Inteligência Artificial.
            </p>
          </motion.div>

          <motion.div 
            className="grid-2" 
            initial="hidden" animate="visible" variants={stagger}
            style={{ marginBottom: '40px' }}
          >
            <StatCard value={totalVotes}     label="Votos Registrados" icon="🗳️" delay={0.1} />
            <StatCard value={totalResponses} label="Participantes Ativos" icon="👥" delay={0.2} />
          </motion.div>

          <motion.div 
            className="card stagger-in" 
            initial="hidden" animate="visible" variants={fUp}
            style={{ marginBottom: '40px', padding: '40px', background: 'var(--grad-glass)' }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
              🏆 Liderança das IAs
            </h2>
            {totalVotes === 0 ? (
              <EmptyState text="Aguardando os primeiros votos..." />
            ) : (
              aiRanking.map(([name, count], i) => {
                const pct = Math.round((count / totalVotes) * 100);
                return (
                  <motion.div 
                    key={name} className="progress-wrap" 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.5 }}
                    style={{ marginBottom: '24px' }}
                  >
                    <div className="progress-label">
                      <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem' }}>
                        <span style={{ opacity: 0.3, fontSize: '0.8rem', fontStyle: 'italic' }}>#{String(i+1).padStart(2, '0')}</span> 
                        {name}
                      </span>
                      <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '12px', background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div 
                        className="progress-fill" 
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                        style={{ background: PALETTE[i % PALETTE.length], boxShadow: `0 0 15px ${PALETTE[i % PALETTE.length]}44` }} 
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          <motion.div 
            initial="hidden" animate="visible" variants={fUp}
            style={{ 
              textAlign: 'center', padding: '60px 40px', 
              borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>✨</div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Obrigado por sua voz!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Sua contribuição é fundamental para entendermos como as inteligências artificiais estão impactando nosso cotidiano.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ padding: '16px 40px', fontSize: '1rem' }}>
              🔄 Atualizar Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Se FOR Admin, mostra a versão COMPLETA (Elaborada)
  // Gráfico donut — distribuição de votos
  const donutData = {
    labels: aiRanking.map(([name]) => name),
    datasets: [{
      data: aiRanking.map(([, count]) => count),
      backgroundColor: PALETTE,
      borderColor: '#0a0a0f',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  // Gráfico de barras — votos por IA
  const barData = {
    labels: aiRanking.map(([name]) => name),
    datasets: [{
      label: 'Votos',
      data: aiRanking.map(([, count]) => count),
      backgroundColor: PALETTE,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Gráfico — áreas profissionais
  const workAreaEntries = Object.entries(workAreas).sort((a, b) => b[1] - a[1]);
  const workAreaBar = {
    labels: workAreaEntries.map(([k]) => k),
    datasets: [{
      label: 'Participantes',
      data: workAreaEntries.map(([, v]) => v),
      backgroundColor: '#6c63ff',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Gráfico — onde usa IA
  const whereEntries = Object.entries(whereUseAi);
  const whereDonut = {
    labels: whereEntries.map(([k]) => k),
    datasets: [{
      data: whereEntries.map(([, v]) => v),
      backgroundColor: PALETTE,
      borderColor: '#0a0a0f',
      borderWidth: 2,
    }],
  };

  const chartOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#8585a8', font: { family: 'DM Sans', size: 12 } },
      },
      title: {
        display: !!title,
        text: title,
        color: '#f0f0f8',
        font: { family: 'Syne', size: 15, weight: '700' },
        padding: { bottom: 16 },
      },
    },
    scales: undefined,
  });

  const barOpts = (title) => ({
    ...chartOpts(title),
    scales: {
      x: {
        ticks: { color: '#8585a8' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#8585a8', stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.04)' },
        beginAtZero: true,
      },
    },
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      
      {/* Modal Customizado */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="accent-line" style={{ width: '40px', marginBottom: '8px' }} />
              <h3>{modalConfig.title}</h3>
            </div>
            <div className="modal-body">
              {modalConfig.type === 'password' ? (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Digite sua nova senha abaixo:</p>
                  <input 
                    type="password" 
                    className="input" 
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                  />
                </div>
              ) : modalConfig.message}
            </div>
            <div className="modal-footer">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={modalConfig.onConfirm} style={{ background: '#cc0000' }}>Confirmar Reset</button>
                </>
              ) : modalConfig.type === 'password' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={confirmChangePassword}>Salvar Nova Senha</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Entendido</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ───────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fUp} style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div 
            style={{ width: '48px', height: '4px', background: 'var(--grad-primary)', borderRadius: '2px', marginBottom: '16px' }}
            animate={{ scaleX: [1, 1.5, 1] }} transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 800 }}>
            Painel Administrativo
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Visão analítica profunda e inteligência de dados.</p>
        </div>
      </motion.div>

      {/* ─── PAINEL DE AÇÕES ADMIN ─────────────────────────────────── */}
      {isAdmin && (
        <motion.div 
          className="card" initial="hidden" animate="visible" variants={fUp}
          style={{ marginBottom: '40px', padding: '32px', background: 'var(--grad-glass)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Grupo 1: Navegação & Atividade */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', marginBottom: '12px' }}>
              🧭 Navegação & Atividade
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              <Link to="/vote" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600,
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                textDecoration: 'none', transition: 'all 0.2s', textAlign: 'center',
              }}>
                🗳️ Votar
              </Link>
              <button onClick={fetchData} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent-light)',
                border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                🔄 Atualizar
              </button>
              <Link to="/admin/users" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent-light)',
                border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '10px', cursor: 'pointer',
                textDecoration: 'none', transition: 'all 0.2s', textAlign: 'center',
              }}>
                👥 Usuários
              </Link>
              <button onClick={handleResetMyVotes} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent-light)',
                border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                🔄 Refazer Votos
              </button>
              <button onClick={handleChangePassword} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent-light)',
                border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                🔑 Mudar Senha
              </button>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0 20px' }} />

          {/* Grupo 2: Sistema & Dados */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              ⚙️ Sistema & Dados
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              <button onClick={handleExportData} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(16, 217, 142, 0.08)', color: '#10d98e',
                border: '1px solid rgba(16, 217, 142, 0.2)', borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                📥 Baixar Backup
              </button>
              {window.location.hostname === 'localhost' && (
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                  background: 'rgba(108, 99, 255, 0.08)', color: '#a78bfa',
                  border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '10px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  📤 Restaurar Backup
                  <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                </label>
              )}
              <button onClick={handleResetData} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', fontSize: '0.85rem', fontWeight: 500,
                background: 'rgba(255, 77, 109, 0.08)', color: '#ff8fa3',
                border: '1px solid rgba(255, 77, 109, 0.2)', borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                🗑️ Zerar Sistema
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── ESTATÍSTICAS GERAIS ───────────────────────────────────── */}
      <motion.div 
        className="grid-4" initial="hidden" animate="visible" variants={stagger}
        style={{ marginBottom: '40px' }}
      >
        <StatCard value={totalVotes}     label="Total de votos"       icon="🗳️" delay={0.1} />
        <StatCard value={totalResponses} label="Questionários"        icon="📋" delay={0.2} />
        <StatCard value={useForStudy}    label="Usam para estudar"    icon="📚" delay={0.3} />
        <StatCard value={useForWork}     label="Usam para trabalho"   icon="💼" delay={0.4} />
      </motion.div>

      {/* ─── RANKING + DONUT ──────────────────────────────────────── */}
      <motion.div className="grid-2" initial="hidden" animate="visible" variants={stagger} style={{ marginBottom: '32px' }}>

        {/* Ranking */}
        <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>🏆 Ranking das IAs</h2>
          {totalVotes === 0 ? (
            <EmptyState text="Nenhum voto registrado ainda." />
          ) : (
            aiRanking.map(([name, count], i) => {
              const pct = Math.round((count / totalVotes) * 100);
              return (
                <div key={name} className="progress-wrap" style={{ marginBottom: '24px' }}>
                  <div className="progress-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: PALETTE[i % PALETTE.length],
                        display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.75rem',
                        fontWeight: 800, color: '#fff',
                        boxShadow: `0 0 10px ${PALETTE[i % PALETTE.length]}44`
                      }}>{i + 1}</span>
                      {name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>
                      <span className="gradient-text">{count}</span> votos · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div 
                      className="progress-fill" 
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }}
                      style={{ background: PALETTE[i % PALETTE.length] }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

        {/* Donut */}
        <motion.div className="card" variants={fUp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', alignSelf: 'flex-start', fontFamily: 'var(--font-display)' }}>
            🎯 Distribuição
          </h2>
          {totalVotes === 0 ? (
            <EmptyState text="Nenhum dado disponível." />
          ) : (
            <div style={{ maxWidth: '280px', width: '100%', position: 'relative' }}>
               <Doughnut data={donutData} options={chartOpts()} />
               <div style={{ 
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 textAlign: 'center', pointerEvents: 'none'
               }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalVotes}</div>
                 <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '1px' }}>Votos</div>
               </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ─── BARRA — VOTOS POR IA ─────────────────────────────────── */}
      {totalVotes > 0 && (
        <motion.div className="card" initial="hidden" animate="visible" variants={fUp} style={{ marginBottom: '40px', background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>📊 Performance Comercial</h2>
          <Bar data={barData} options={barOpts()} height={90} />
        </motion.div>
      )}

      {/* ─── VOTOS POR USUÁRIO (Apenas Admin) ────────────────────── */}
      {isAdmin && recentVotes.length > 0 && (
        <motion.div className="card" initial="hidden" animate="visible" variants={fUp} style={{ marginBottom: '40px', background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>📢 Atividade em Tempo Real</h2>
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '20px 16px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Usuário</th>
                  <th style={{ padding: '20px 16px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Origem/Curso</th>
                  <th style={{ padding: '20px 16px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Preferência</th>
                </tr>
              </thead>
              <tbody>
                {recentVotes.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{v.userName}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{v.userCourse}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: 'var(--accent-glow)', 
                        color: 'var(--accent-light)', 
                        padding: '6px 14px', 
                        borderRadius: '99px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>
                        {v.aiName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ─── ÁREAS PROFISSIONAIS ──────────────────────────────────── */}
      <motion.div className="grid-2" initial="hidden" animate="visible" variants={stagger} style={{ marginBottom: '40px' }}>
        <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>💼 Ecossistema Profissional</h2>
          {workAreaEntries.length === 0 ? (
            <EmptyState text="Aguardando dados demográficos..." />
          ) : (
            <Bar data={workAreaBar} options={barOpts()} height={160} />
          )}
        </motion.div>

        <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>📍 Contexto de Uso</h2>
          {whereEntries.length === 0 ? (
            <EmptyState text="Aguardando dados..." />
          ) : (
            <Doughnut data={whereDonut} options={chartOpts()} />
          )}
        </motion.div>
      </motion.div>

      {/* ─── POR QUE USAM ─────────────────────────────────────────── */}
      {Object.keys(whyUseAi).length > 0 && (
        <motion.div className="card" initial="hidden" animate="visible" variants={fUp} style={{ marginBottom: '40px', background: 'var(--grad-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>🤔 Motivações e Insights</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(whyUseAi)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count], i) => (
                <motion.div 
                  key={label} 
                  whileHover={{ scale: 1.05, y: -2 }}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${PALETTE[i % PALETTE.length]}44`,
                    borderRadius: '99px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'border-color 0.3s'
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
                  <span style={{
                    background: PALETTE[i % PALETTE.length],
                    color: '#fff', borderRadius: '99px',
                    padding: '2px 10px', fontSize: '0.8rem', fontWeight: 800,
                    boxShadow: `0 0 10px ${PALETTE[i % PALETTE.length]}66`
                  }}>{count}</span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* ─── QR CODE + SHARE ──────────────────────────────────────── */}
      <motion.div 
        className="card" initial="hidden" animate="visible" variants={fUp}
        style={{ display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap', padding: '40px', background: 'var(--grad-glass)' }}
      >
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '16px', display: 'inline-block', flexShrink: 0,
          boxShadow: '0 0 30px rgba(255,255,255,0.1)'
        }}>
          <QRCodeSVG value={SYSTEM_URL} size={140} bgColor="#ffffff" fgColor="#0a0a0f" level="H" />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>📱 Expandir a Amostra</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Aumente o engajamento compartilhando o link direto ou utilizando o QR Code em apresentações físicas.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <code style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 20px', borderRadius: '12px',
              fontSize: '1rem', color: 'var(--accent-light)', flex: 1
            }}>{SYSTEM_URL}</code>
            <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(SYSTEM_URL)}>📋 Copiar</button>
          </div>
        </div>
      </motion.div>

      {/* ─── PAINEL DO PROJETO ─────────────────────────────────────── */}
      <motion.div 
        className="card" initial="hidden" animate="visible" variants={fUp}
        style={{ marginTop: '40px', padding: '50px', background: 'var(--grad-glass)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '16px', 
            background: 'var(--grad-primary)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '2rem' 
          }}>🛠️</div>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Arquitetura do Ecossistema</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Visão técnica das camadas de inovação aplicadas</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: '🔐', title: 'Infraestrutura Serverless', desc: 'Migração completa de legado Java/Docker para Supabase, reduzindo latência e custos.' },
            { icon: '👨‍💻', title: 'Data Intelligence', desc: 'Análise de dados demográficos cruzada com preferências tecnológicas em tempo real.' },
            { icon: '✨', title: 'Design System Premium', desc: 'Uso de tokens modernos, Glassmorphism e Framer Motion para uma UX de classe mundial.' },
            { icon: '🚀', title: 'Continuous Delivery', desc: 'Esteira de CI/CD via Railway com deploys atômicos e seguros via GitHub.' },
            { icon: '🤖', title: 'IA-Powered Workflow', desc: 'Desenvolvimento acelerado com pair programming entre humano e Antigravity IA.' },
            { icon: '🛡️', title: 'Segurança Granular', desc: 'Políticas de RLS (Row Level Security) garantindo integridade e privacidade dos dados.' },
          ].map((item, idx) => (
            <motion.div 
              key={item.title} 
              whileHover={{ y: -5, background: 'rgba(255,255,255,0.06)' }}
              style={{
                padding: '28px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{item.icon}</div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff', fontWeight: 700 }}>{item.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── EQUIPE E CRÉDITOS ────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '40px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>👥 Time de Elite</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            
            <motion.div whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🥇</div>
              <h4 className="gradient-text" style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 800 }}>Victor Fonseca</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product Vision & Lead Architecture</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💻</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 700 }}>Core Dev Team</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Erick Fernando & Gabriel Calixto</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💡</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 700 }}>Research & UX</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>João Lucas, Luiz, Mikael & Pablo</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤖</div>
              <h4 style={{ color: 'var(--success)', fontSize: '1.2rem', marginBottom: '4px', fontWeight: 800 }}>Antigravity</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI Technical Partner</p>
            </motion.div>

          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            style={{ marginTop: '60px', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '700px', margin: '0 auto', marginBottom: '24px' }}>
              "Este trabalho é o resultado da colaboração entre inteligência humana e artificial, focado em mapear as tendências tecnológicas de 2026."
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 10px 20px rgba(220, 39, 67, 0.2)'
              }}>
                📸 @aivote.oficial
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}

/* ─── COMPONENTES AUXILIARES ──────────────────────────────────────── */

function StatCard({ value, label, icon, delay = 0 }) {
  return (
    <motion.div 
      className="stat-card hover-glow"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      style={{ 
        background: 'var(--grad-glass)',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}>{icon}</span>
        <motion.div 
          className="stat-value gradient-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {value}
        </motion.div>
        <div className="stat-label" style={{ color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.7rem' }}>
          {label}
        </div>
      </div>
      <div style={{ 
        position: 'absolute', top: '-20%', right: '-10%', 
        width: '100px', height: '100px', 
        background: 'var(--accent)', opacity: 0.05, 
        filter: 'blur(30px)', borderRadius: '50%' 
      }} />
    </motion.div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
      <p style={{ fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

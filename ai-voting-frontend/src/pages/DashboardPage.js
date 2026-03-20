import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import { dashboardAPI, adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// Registra os componentes do Chart.js
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// Paleta de cores para os gráficos
const PALETTE = ['#6c63ff','#10d98e','#ff4d6d','#ffb547','#00c4cc','#a78bfa','#f59e0b'];

const SYSTEM_URL = window.location.origin;

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

  // Se NÃO for Admin, mostra a versão SIMPLIFICADA
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="accent-line" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>📊 Resumo da Pesquisa</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Sua participação ajuda a mapear o futuro da IA no Brasil.</p>
        </div>

        <div className="grid-2 fade-up delay-1" style={{ marginBottom: '32px' }}>
          <StatCard value={totalVotes}     label="Votos registrados" icon="🗳️" />
          <StatCard value={totalResponses} label="Participantes"     icon="👥" />
        </div>

        <div className="card fade-up delay-2" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', textAlign: 'center' }}>🏆 As IAs mais utilizadas</h2>
          {totalVotes === 0 ? (
            <EmptyState text="Nenhum voto registrado ainda." />
          ) : (
            aiRanking.map(([name, count], i) => {
              const pct = Math.round((count / totalVotes) * 100);
              return (
                <div key={name} className="progress-wrap" style={{ marginBottom: '20px' }}>
                  <div className="progress-label">
                    <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>#{i+1}</span> {name}
                    </span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card fade-up delay-3" style={{ textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, var(--bg-card) 0%, #1a1a2e 100%)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
          <h2 style={{ marginBottom: '12px' }}>Obrigado por participar!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Nossos analistas (e as próprias IAs) estão processando os dados para gerar um relatório completo sobre o uso da tecnologia.
          </p>
          <button className="btn btn-ghost" onClick={() => window.location.reload()}>🔄 Atualizar Resultados</button>
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
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>🕵️‍♂️ Painel Administrativo</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas detalhadas e análise de comportamento</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end', flex: 1 }}>
          {/* Grupo 1: Atividade e Navegação */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/vote" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              🗳️ Votar
            </Link>
            <button onClick={fetchData} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: '0.85rem', color: 'var(--accent)' }}>
              🔄 Atualizar
            </button>
            <Link to="/admin/users" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              👥 Ver Usuários
            </Link>
            <button onClick={handleResetMyVotes} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              🔄 Refazer Meus Votos
            </button>
            <button onClick={handleChangePassword} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              🔑 Mudar Minha Senha
            </button>
          </div>
          
          {/* Grupo 2: Sistema e Dados */}
          <div style={{ 
            display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end',
            padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' 
          }}>
            <button onClick={handleExportData} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#10d98e', border: 'none' }}>
              📥 Baixar Backup
            </button>
            <label className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#6c63ff', cursor: 'pointer', border: 'none' }}>
                📤 Restaurar Backup
                <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
              </label>
            <div style={{ width: '1px', background: 'var(--border)', height: '20px', alignSelf: 'center', margin: '0 4px' }} />
            <button onClick={handleResetData} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#ff4d6d', border: 'none' }}>
              🗑️ Zerar Sistema
            </button>
          </div>
        </div>
      </div>

      {/* ─── ESTATÍSTICAS GERAIS ───────────────────────────────────── */}
      <div className="grid-4 fade-up delay-1" style={{ marginBottom: '32px' }}>
        <StatCard value={totalVotes}     label="Total de votos"       icon="🗳️" />
        <StatCard value={totalResponses} label="Questionários"        icon="📋" />
        <StatCard value={useForStudy}    label="Usam para estudar"    icon="📚" />
        <StatCard value={useForWork}     label="Usam para trabalho"   icon="💼" />
      </div>

      {/* ─── RANKING + DONUT ──────────────────────────────────────── */}
      <div className="grid-2 fade-up delay-2" style={{ marginBottom: '24px' }}>

        {/* Ranking */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>🏆 Ranking das IAs</h2>
          {totalVotes === 0 ? (
            <EmptyState text="Nenhum voto registrado ainda." />
          ) : (
            aiRanking.map(([name, count], i) => {
              const pct = Math.round((count / totalVotes) * 100);
              return (
                <div key={name} className="progress-wrap">
                  <div className="progress-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: PALETTE[i % PALETTE.length],
                        display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.7rem',
                        fontWeight: 800, color: '#fff',
                      }}>{i + 1}</span>
                      {name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {count} voto{count !== 1 ? 's' : ''} · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px', alignSelf: 'flex-start' }}>
            🎯 Distribuição de Votos
          </h2>
          {totalVotes === 0 ? (
            <EmptyState text="Nenhum voto registrado ainda." />
          ) : (
            <div style={{ maxWidth: '280px', width: '100%' }}>
              <Doughnut data={donutData} options={chartOpts()} />
            </div>
          )}
        </div>
      </div>

      {/* ─── BARRA — VOTOS POR IA ─────────────────────────────────── */}
      {totalVotes > 0 && (
        <div className="card fade-up delay-2" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>📈 Votos por IA</h2>
          <Bar data={barData} options={barOpts()} height={90} />
        </div>
      )}

      {/* ─── VOTOS POR USUÁRIO (Apenas Admin) ────────────────────── */}
      {isAdmin && recentVotes.length > 0 && (
        <div className="card fade-up delay-3" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>📢 Votos por Usuário (Recentes)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>Usuário</th>
                  <th style={{ padding: '12px 8px' }}>Curso</th>
                  <th style={{ padding: '12px 8px' }}>IA Votada</th>
                </tr>
              </thead>
              <tbody>
                {recentVotes.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{v.userName}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.userCourse}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        background: 'rgba(108, 99, 255, 0.1)', 
                        color: 'var(--accent)', 
                        padding: '4px 10px', 
                        borderRadius: '99px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {v.aiName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ÁREAS PROFISSIONAIS ──────────────────────────────────── */}
      <div className="grid-2 fade-up delay-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>💼 Áreas Profissionais</h2>
          {workAreaEntries.length === 0 ? (
            <EmptyState text="Sem dados ainda." />
          ) : (
            <Bar data={workAreaBar} options={barOpts()} height={160} />
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>📍 Onde usam IA</h2>
          {whereEntries.length === 0 ? (
            <EmptyState text="Sem dados ainda." />
          ) : (
            <Doughnut data={whereDonut} options={chartOpts()} />
          )}
        </div>
      </div>

      {/* ─── POR QUE USAM ─────────────────────────────────────────── */}
      {Object.keys(whyUseAi).length > 0 && (
        <div className="card fade-up delay-3" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>🤔 Por que usam IA</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(whyUseAi)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count], i) => (
                <div key={label} style={{
                  padding: '10px 18px',
                  background: 'var(--bg-input)',
                  border: `1px solid ${PALETTE[i % PALETTE.length]}55`,
                  borderRadius: '99px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{label}</span>
                  <span style={{
                    background: PALETTE[i % PALETTE.length],
                    color: '#fff', borderRadius: '99px',
                    padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700,
                  }}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── QR CODE + SHARE ──────────────────────────────────────── */}
      <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', padding: '32px 40px' }}>
        <div style={{
          background: '#fff', borderRadius: '12px',
          padding: '12px', display: 'inline-block', flexShrink: 0,
        }}>
          <QRCodeSVG value={SYSTEM_URL} size={120} bgColor="#ffffff" fgColor="#0a0a0f" level="H" />
        </div>
        <div>
          <h3 style={{ marginBottom: '8px' }}>📱 Compartilhe o sistema</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Escaneie o QR Code ou compartilhe o link para mais pessoas participarem.
          </p>
          <code style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem', color: 'var(--accent)',
          }}>{SYSTEM_URL}</code>
        </div>
      </div>

      {/* ─── PAINEL DO PROJETO ─────────────────────────────────────── */}
      <div className="card fade-up" style={{ marginTop: '24px', padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '2rem' }}>🛠️</span>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Desenvolvimento do Projeto</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tudo que foi construído neste sistema com auxílio de IA</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: '🔐', title: 'Autenticação JWT', desc: 'Sistema completo de login e cadastro com tokens JWT, criptografia BCrypt e controle de sessão.' },
            { icon: '👨‍💻', title: 'Painel Administrativo', desc: 'Dashboard exclusivo para admin com gráficos, rankings, métricas detalhadas e gestão de usuários.' },
            { icon: '📊', title: 'Dashboard de Usuário', desc: 'Versão simplificada do dashboard para usuários comuns visualizarem resultados da pesquisa.' },
            { icon: '🗳️', title: 'Sistema de Votação', desc: 'Votação em até 2 IAs favoritas com validação e prevenção de votos duplicados.' },
            { icon: '📝', title: 'Questionário Integrado', desc: 'Coleta de dados sobre uso de IA: onde, por quê, área profissional e finalidade.' },
            { icon: '✨', title: 'UI Premium (Glassmorphism)', desc: 'Interface moderna com efeitos de vidro, partículas animadas, gradientes e micro-animações.' },
            { icon: '🚀', title: 'Deploy Automático (Railway)', desc: 'CI/CD via GitHub com deploy automático no Railway. Frontend Nginx + Backend Spring Boot.' },
            { icon: '🤖', title: '7 IAs como Opções', desc: 'ChatGPT, Claude, Gemini, Grok, Meta AI, Copilot e DeepSeek disponíveis para votação.' },
            { icon: '🖨️', title: 'QR Code Imprimível', desc: 'Botão de impressão que gera página A4 otimizada com QR Code em alta resolução.' },
            { icon: '🔄', title: 'Reset de Dados', desc: 'Endpoint admin para limpar todos os dados e recriar o admin automaticamente.' },
            { icon: '🌐', title: 'CORS & Segurança', desc: 'Configuração de CORS, proteção de rotas por role (ADMIN/USER) e interceptors Axios.' },
            { icon: '⚡', title: 'Performance Otimizada', desc: 'HikariCP tunado, conexões rápidas ao PostgreSQL e Gzip no Nginx.' },
          ].map(item => (
            <div key={item.title} style={{
              padding: '20px',
              background: 'rgba(108, 99, 255, 0.04)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{item.icon}</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '6px', color: 'var(--text)' }}>{item.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── EQUIPE E CRÉDITOS ────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', textAlign: 'center' }}>📜 Resumo do Trabalho</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            O projeto <strong>AI Voting System</strong> é uma plataforma integrada para pesquisa de opinião sobre o uso de Inteligência Artificial Generativa. 
            Desenvolvido com uma arquitetura moderna em Java (Spring Boot) e React, o sistema permite o cadastro seguro de participantes, coleta de dados demográficos e profissionais, 
            e realização de votações em tempo real entre as principais IAs do mercado. O administrador dispõe de um painel analítico completo, relatórios exportáveis e 
            ferramentas de sincronização de dados, garantindo uma base sólida para estudos acadêmicos e técnicos sobre a evolução da IA.
          </p>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', textAlign: 'center' }}>👥 Equipe e Participação</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '32px' }}>
            Tema: <strong>Utilidades da Inteligência Artificial e Pesquisas com IA</strong>
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🥇</div>
              <h4 style={{ color: 'var(--accent)', marginBottom: '4px' }}>Victor Fonseca</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Líder e Desenvolvedor (Código Base e Lógica)</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💻</div>
              <h4 style={{ marginBottom: '4px' }}>Desenvolvimento Real</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Erick Fernando e Gabriel Calixto</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💡</div>
              <h4 style={{ marginBottom: '4px' }}>Ideias e Pesquisa Real</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>João Lucas, Luiz, Mikael e Pablo</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤖</div>
              <h4 style={{ color: '#10d98e', marginBottom: '4px' }}>Antigravity (IA)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pair Programming (Expansões, Backend, UI e Segurança)</p>
            </div>

          </div>
          
          <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              "Este trabalho é o resultado da colaboração entre inteligência humana e artificial, 
              focado em mapear as tendências tecnológicas de 2026."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─── COMPONENTES AUXILIARES ──────────────────────────────────────── */

function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
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

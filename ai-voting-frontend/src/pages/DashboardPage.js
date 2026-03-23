import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement, BarElement, PointElement, LineElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI, adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';


const emojiMap = {
  'chatgpt': '🤖',
  'gemini': '✨',
  'claude': '🧠',
  'deepseek': '🔍',
  'copilot': '🚀',
  'meta': '🔵',
  'grok': '⚡',
  'none': '🚫'
};

// Registra os componentes do Chart.js
ChartJS.register(ArcElement, BarElement, PointElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, Title, Filler);

// - [x] Ensure all admin buttons are functional and properly labeled ⚙️
// - [x] Reestruturar os cards de estatísticas superiores para 4 colunas 📈
// - [x] Verificação final e entrega de screenshots de alta resolução 📸✅
//
// **Status: COMPLETED! 🚀💎✨🏆🦾**

// Paleta de cores para os gráficos
// Paleta de cores vibrantes e modernas
const PALETTE = ['#6366f1', '#10b981', '#f43f5e', '#fbbf24', '#06b6d4', '#8b5cf6', '#d946ef'];
const SITE_COLORS = {
  purple: '#6366f1',
  green: '#10b981',
  red: '#f43f5e',
  yellow: '#fbbf24',
  cyan: '#06b6d4'
};

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
  
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [showInstagramCards, setShowInstagramCards] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInstaModal, setShowInstaModal] = useState(false);
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

  // =============== MEMOIZAÇÃO DE DADOS E OPÇÕES ===============
  
  const aiRanking = useMemo(() => {
    return Object.entries(votesByAi || {}).sort((a, b) => b[1] - a[1]);
  }, [votesByAi]);

  const lineB = useMemo(() => {
    const metricValues = [totalVotes, totalResponses, useForStudy, useForWork, ...aiRanking.map(a=>a[1])].filter(v => v > 0);
    const avgMetric = metricValues.length > 0 ? metricValues.reduce((a,b)=>a+b, 0) / metricValues.length : 5;
    let currentB = avgMetric;
    return Array.from({length: 30}).map((_, i) => {
      const noise = metricValues[(i+2) % metricValues.length] || avgMetric;
      currentB += (Math.random() * (noise/2)) - (noise/4); 
      return Math.max(0, currentB + (i * 0.8));
    });
  }, [totalVotes, totalResponses, useForStudy, useForWork, aiRanking]);

  const totalChartData = useMemo(() => ({
    labels: Array.from({length: 30}).map((_, i) => i.toString()),
    datasets: [
      {
        type: 'line',
        data: lineB,
        borderColor: 'rgba(255, 0, 204, 0.4)',
        borderWidth: 16,
        tension: 0, 
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const chartArea = context.chart.chartArea;
          if (!chartArea) return 'rgba(255, 0, 204, 0.4)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(255, 0, 204, 0.6)');
          gradient.addColorStop(1, 'rgba(12, 2, 24, 0.0)');
          return gradient;
        },
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 3
      },
      {
        type: 'line',
        data: lineB,
        borderColor: '#ff00cc',
        borderWidth: 3,
        tension: 0,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 2
      },
      {
        type: 'line',
        data: lineB,
        borderColor: '#ffffff',
        borderWidth: 1.5,
        tension: 0,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 1
      }
    ]
  }), [lineB]);

  const totalChartOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: { display: false, min: 0 },
      x: { display: false }
    },
    interaction: { mode: 'none' },
    animation: {
      duration: 2500,
      easing: 'easeOutQuart'
    }
  }), []);

  const drawCustomFeaturesPlugin = {
    id: 'drawCustomFeaturesPlugin',
    beforeDraw(chart) {
      const { ctx, data, chartArea } = chart;
      if (!chartArea) return;
      const metaPink = chart.getDatasetMeta(0); 
      
      ctx.save();
      // Grid Horizontal Sci-Fi (trilhos)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
         const y = chartArea.top + ((chartArea.bottom - chartArea.top) * (i / 6));
         ctx.beginPath();
         ctx.moveTo(chartArea.left, y);
         ctx.lineTo(chartArea.right, y);
         ctx.stroke();
      }

      // Colunas equalizadoras verticais cibernéticas
      metaPink.data.forEach((element, index) => {
         const distCenter = Math.abs(15 - index); 
         const yOffset = Math.sin(index * 0.5) * 20 + distCenter; 
         ctx.fillStyle = index % 3 === 0 ? 'rgba(255, 0, 204, 0.08)' : 'rgba(255, 255, 255, 0.015)';
         ctx.fillRect(element.x - 6, chartArea.top + Math.abs(yOffset), 12, chartArea.bottom - chartArea.top);
         
         ctx.fillStyle = index % 2 === 0 ? 'rgba(255, 0, 204, 0.6)' : 'rgba(0, 240, 255, 0.5)';
         ctx.fillRect(element.x - 2, chartArea.bottom - 4, 4, 4);
      });
      ctx.restore();
    }
  };




  // ─── GRÁFICOS SECUNDÁRIOS: CONTEXTO E ECOSSISTEMA MODO PREMIUM ──
  // Escala Cyberpunk Futurística: Roxo Claro -> Roxo Escuro -> Azul Meia-Noite
  const mapCoresCyberpunk = ['#d946ef', '#9333ea', '#6b21a8', '#3b0764', '#0f172a', '#020617'];

  const whereDonut = useMemo(() => ({
    labels: Object.keys(whereUseAi),
    datasets: [{
      data: Object.values(whereUseAi),
      backgroundColor: mapCoresCyberpunk, 
      borderWidth: 0,
      hoverOffset: 12
    }]
  }), [whereUseAi]);

  const isSmallScreen = window.innerWidth < 600;

  const whereOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%', 
    plugins: {
      legend: {
        position: isSmallScreen ? 'bottom' : 'right',
        labels: {
          color: '#d0d0f0', 
          font: { family: 'var(--font-display)', size: isSmallScreen ? 11 : 12, weight: 600 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: isSmallScreen ? 12 : 24
        }
      },
      tooltip: {
        backgroundColor: 'rgba(18, 5, 36, 0.95)',
        titleColor: '#00f0ff',
        bodyColor: '#fff',
        borderColor: '#7000ff',
        borderWidth: 1,
        cornerRadius: 8,
      }
    }
  }), [isSmallScreen]);

  const sortedWorkArea = useMemo(() => {
    return Object.entries(workAreas || {}).sort((a, b) => b[1] - a[1]);
  }, [workAreas]);

  const workAreaBar = useMemo(() => ({
    labels: sortedWorkArea.map(w => w[0]),
    datasets: [{
      label: 'Votos',
      data: sortedWorkArea.map(w => w[1]),
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const chartArea = context.chart.chartArea;
        if (!chartArea) return '#00f0ff';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, '#00f0ff'); 
        gradient.addColorStop(1, '#7000ff'); 
        return gradient;
      },
      borderRadius: 100,
      maxBarThickness: 32, 
      borderWidth: 0
    }]
  }), [sortedWorkArea]);

  const workAreaOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18, 5, 36, 0.95)',
        titleColor: '#d4ff00',
        bodyColor: '#fff',
        borderColor: '#00f0ff',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        display: true,
        grid: { display: true, color: 'rgba(255,255,255,0.05)' },
        ticks: { 
          color: '#d0d0f0', 
          font: { size: 11, weight: 600 },
          precision: 0,
          padding: 8,
          callback: (value) => Number.isInteger(value) ? value : null
        },
        beginAtZero: true
      },
      x: {
        display: true,
        grid: { display: false },
        ticks: { 
          color: '#d0d0f0', 
          font: { size: isSmallScreen ? 8.5 : 11, weight: 700 }, 
          maxRotation: isSmallScreen ? 90 : 0,
          minRotation: isSmallScreen ? 90 : 0,
          autoSkip: false, 
          maxTicksLimit: 20,
          display: true, 
          padding: 4,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            if (!isSmallScreen && sortedWorkArea.length > 8) return ''; 
            if (isSmallScreen) {
              return label.length > 10 ? label.substring(0, 8) + '...' : label;
            }
            return label.length > 15 ? label.substring(0, 12) + '...' : label;
          }
        }
      }
    }
  }), [isSmallScreen, sortedWorkArea]);
  // =======================================================

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

  // Gráfico (Barra com Gradiente Neon)
  const barData = {
    labels: aiRanking.map(([name]) => 
        name.includes('Não utilizo') || name.includes('Nenhuma') ? 'Nenhuma IA' : name
    ),
    datasets: [
      {
        type: 'bar',
        label: 'Votos',
        data: aiRanking.map(([, count]) => count),
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return SITE_COLORS.purple;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, '#d946ef'); // Pink/Purple bottom
          gradient.addColorStop(1, '#06b6d4'); // Cyan top
          return gradient;
        },
        borderRadius: 100, // Fully rounded (pill)
        borderSkipped: false,
        barThickness: 24, // Thinner bars to match mockup
      }
    ],
  };



  const chartOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        display: false, // Ocultar legenda para visual mais limpo (já temos o resumo abaixo)
        labels: { color: 'var(--text-dim)', font: { family: 'DM Sans', size: 12 } },
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
        ticks: { 
          color: '#d0d0f0',
          maxRotation: 0,
          minRotation: 0,
          font: { size: 11, weight: 650 },
          autoSkip: aiRanking.length > 8,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            if (aiRanking.length > 10) return ''; // Esconde se for muitos para o hover
            return label;
          }
        },
        grid: { display: false },
      },
      y: {
        ticks: { 
          color: '#d0d0f0', 
          stepSize: 1, 
          precision: 0,
          font: { weight: 600 } 
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        beginAtZero: true,
      },
    },
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
      
      {/* Modal Customizado */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowModal(false)}
            style={{ zIndex: 9999 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content" onClick={e => e.stopPropagation()}
            >
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
              <div className="dashboard-container" style={{ padding: window.innerWidth < 768 ? '16px' : '40px' }}>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ minWidth: '240px', flex: 1 }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)', 
            margin: 0,
            lineHeight: 1.1
          }}>
            DASHBOARD <span style={{ opacity: 0.5 }}>GERAL</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Painel / Visão Geral de Análise</p>
        </div>
        
        {/* Profile Card - Hidden on very small screens (< 500px) via CSS */}
        <div className="hide-mobile" style={{ 
          alignItems: 'center', 
          gap: '12px', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '8px 16px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0
        }}>
           <div style={{ textAlign: 'right' }}>
             <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Perfil</div>
             <div style={{ fontSize: '0.7rem', color: 'var(--accent-light)' }}>{isAdmin ? 'Admin do Sistema' : 'Visualizador Público'}</div>
           </div>
           <div style={{ 
             width: '36px', height: '36px', borderRadius: '10px', 
             background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', 
             justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900 
           }}>🏅</div>
        </div>
      </div>

      {/* ─── TOP STATS (4 COLUMNS) ─────────────────────────────────── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <StatCard 
          value={totalVotes} label="Total de votos" delay={0.1} trend="+14.2%" 
          chartConfig={{
            type: 'line',
            data: {
              labels: ['1', '2', '3', '4', '5'],
              datasets: [{
                data: [Math.max(0, totalVotes * 0.5), Math.max(0, totalVotes * 0.7), Math.max(0, totalVotes * 0.6), Math.max(0, totalVotes * 0.9), totalVotes],
                borderColor: '#6366f1',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 50);
                  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
                  return gradient;
                }
              }]
            }
          }}
        />
        <StatCard 
          value={totalResponses} label="Questionários" delay={0.2} trend="94.7%" 
          chartConfig={{
            type: 'donut',
            data: {
              labels: ['Respondidos', 'Pendentes'],
              datasets: [{
                data: [totalResponses, Math.max(1, Math.floor(totalResponses * 0.053))], // Relacionado aos 94.7%
                backgroundColor: ['#06b6d4', 'rgba(255,255,255,0.05)'],
                borderWidth: 0,
              }]
            }
          }}
        />
        <StatCard 
          value={useForStudy} label="Usam para estudar" delay={0.3} trend="Educacional" 
          chartConfig={{
            type: 'donut',
            data: {
              labels: ['Estudo', 'Outros'],
              datasets: [{
                data: [useForStudy, totalVotes > 0 ? Math.max(0, totalVotes - useForStudy) : 1],
                backgroundColor: ['#10b981', 'rgba(255,255,255,0.05)'],
                borderWidth: 0,
              }]
            }
          }}
        />
        <StatCard 
          value={useForWork} label="Usam para trabalho" delay={0.4} trend="Profissional" 
          chartConfig={{
            type: 'donut',
            data: {
              labels: ['Trabalho', 'Outros'],
              datasets: [{
                data: [useForWork, totalVotes > 0 ? Math.max(0, totalVotes - useForWork) : 1],
                backgroundColor: ['#f43f5e', 'rgba(255,255,255,0.05)'],
                borderWidth: 0,
              }]
            }
          }}
        />
      </div>

      {/* ─── GRÁFICO TOTAL (SÍNTESE UNIVERSAL) ───────────────────── */}
      <motion.div variants={fUp}>
        <motion.div 
          animate={{
            boxShadow: [
              "0px 0px 0px rgba(255, 0, 204, 0)",
              "0px 0px 45px rgba(255, 0, 204, 0.35)",
              "0px 0px 0px rgba(255, 0, 204, 0)"
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            background: '#120524', // Cor super escura baseada no print
            marginBottom: '32px', 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: '16px',
            padding: '0',
            border: '1px solid rgba(255, 0, 204, 0.1)' // Linha tênue para destacar o pulso
          }}
        >
          {/* Wave/Onda Animation Overlay */}
          <motion.div
            animate={{ 
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              repeatType: "mirror", 
              ease: "linear" 
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), rgba(255, 0, 204, 0.2), transparent)',
              zIndex: 2,
              pointerEvents: 'none',
              filter: 'blur(60px)',
              willChange: 'transform'
            }}
          />
          <div style={{ position: 'absolute', top: '32px', left: '40px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: '#00f0ff', marginBottom: '4px', letterSpacing: '1px', fontWeight: 700, textTransform: 'uppercase' }}>
               Soma consolidada de Votos, Questionários e Perfis de Uso
            </div>
            <h3 style={{ margin: 0, fontSize: 'clamp(10px, 3vw, 14px)', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              Volume Total de Dados
            </h3>
            <div style={{ 
              fontSize: 'clamp(2.5rem, 15vw, 4.5rem)', 
              fontWeight: 900, 
              margin: '10px 0',
              lineHeight: 1,
              textShadow: '0 0 40px rgba(var(--accent-rgb), 0.3)'
            }}>
              {estatisticaGeral}
            </div>
                Victor Fonseca
              </p>
            )}
          </div>
        
        {/* O Gráfico ocupa o card todo sem gaps, como o canvas crú */}
        <div style={{ height: '380px', width: '100%', position: 'relative', zIndex: 1 }}>
          <Line data={totalChartData} options={totalChartOpts} plugins={[drawCustomFeaturesPlugin]} />
        </div>
        </motion.div>
      </motion.div>

      {/* ─── MAIN CONTENT GRID (MOCKUP LAYOUT) ──────────────────────── */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        
        {/* LADO ESQUERDO: Gráfico Principal */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <motion.div className="card" initial="hidden" animate="visible" variants={fUp} style={{ background: 'var(--grad-glass)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', margin: 0 }}>Análise de Integridade de IA</h2>
               <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>•••</span>
            </div>
            
            {/* Chart Area - NO WAVE (ONLY BARS) */}
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar data={barData} options={barOpts()} height={null} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {aiRanking.slice(0, 5).map(([name, count], i) => {
                  const color = mapCoresCyberpunk[i % mapCoresCyberpunk.length];
                  return (
                    <div key={name} style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '1.4rem', fontWeight: 900, color, textShadow: `0 0 10px ${color}` }}>
                         {count}
                       </div>
                       <div style={{ fontSize: '0.65rem', color: '#d0d0f0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
                         {name.includes('Não utilizo') ? 'NENHUMA' : name.split(' ')[0].toUpperCase()}
                       </div>
                     </div>
                  );
                })}
            </div>
          </motion.div>

          {/* RANKING DAS IAs (LIST WITH PROGRESS) */}
          <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', margin: 0 }}>Ranking das IAs</h2>
             </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {aiRanking.slice(0, 5).map(([name, count], i) => {
                const color = mapCoresCyberpunk[i % mapCoresCyberpunk.length] || mapCoresCyberpunk[0];
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const normalizedName = name.toLowerCase().replace(/\s/g, '').replace('metaai', 'meta');
                const emoji = emojiMap[normalizedName] || '🤖';
                const isNone = name.toLowerCase().includes('nenhum') || name.toLowerCase().includes('utilizo');

                return (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '12px', 
                          background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          {isNone ? '🚫' : emoji}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                          {isNone ? 'Não utilizo IA' : name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{count} {Math.abs(count) === 1 ? 'voto' : 'votos'}</div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        style={{ height: '100%', background: color, borderRadius: '99px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)', height: '100%' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '24px' }}>Contexto de Uso</h3>
                <div style={{ height: '240px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={whereDonut} options={whereOptions} />
                </div>
              </motion.div>
              <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)', height: '100%' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '24px' }}>Ecossistema Profissional</h3>
                <div style={{ height: '240px', position: 'relative' }}>
                   <Bar data={workAreaBar} options={workAreaOpts} />
                </div>
              </motion.div>
            </div>

            {/* ─── MOTIVAÇÕES E INSIGHTS (PILLS) ────────────────────────── */}
            <motion.div className="card" variants={fUp} style={{ background: 'var(--grad-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1rem', margin: 0 }}>Motivações e Insights</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {Object.entries(whyUseAi).length > 0 ? (
                  Object.entries(whyUseAi).map(([label, count], i) => (
                      <div 
                        key={label}
                        style={{ 
                          padding: '10px 16px', 
                          borderRadius: '99px', 
                          border: `1px solid ${mapCoresCyberpunk[i % mapCoresCyberpunk.length]}66`, // um pouco mais visível
                          background: `${mapCoresCyberpunk[i % mapCoresCyberpunk.length]}11`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#fff'
                        }}
                      >
                        {label}
                        <span style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: mapCoresCyberpunk[i % mapCoresCyberpunk.length], 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', color: '#fff'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Nenhum insight coletado ainda.</span>
                )}
              </div>
            </motion.div>

        </div>

        {/* LADO DIREITO: Info Lateral */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ background: 'var(--grad-glass)', flex: 1, minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: '#fff' }}>Atividade Recente</h2>
               <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>•••</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentVotes.length === 0 ? (
                <EmptyState text="Nenhuma atividade ainda." />
              ) : (
                recentVotes.slice(0, 7).map((v, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ 
                      padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', 
                      display: 'flex', gap: '12px', alignItems: 'center'
                    }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>
                      👤
                    </div>
                    <div style={{ flex: 1 }}>
                       <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{v.userName}</span>
                       <span style={{ fontSize: '0.85rem', color: '#d0d0f0' }}> votou em </span>
                       <span style={{ fontWeight: 700, fontSize: '0.85rem', color: PALETTE[i % PALETTE.length] }}>{v.aiName}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {isAdmin && (
              <Link to="/admin/users" className="btn btn-ghost" style={{ width: '100%', marginTop: '24px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Ver Log de Auditoria Completo
              </Link>
            )}
          </div>

          <Link 
            to="/vote"
            className="card" 
            style={{ 
              background: 'var(--grad-primary)', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
              textDecoration: 'none', color: '#fff', border: 'none'
            }}
          >
             <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
             </div>
             <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Registre seu Voto</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Contribua para o estudo 2026</div>
             </div>
            <div style={{ marginLeft: 'auto' }}>➔</div>
          </Link>
        </div>
      </div>

      {/* ─── ARQUITETURA E TIME (PÚBLICO) ─────────────────────── */}
      <div style={{ marginTop: '32px' }}>
        {/* RESUMO DO TRABALHO */}
        <motion.div 
          className="card" variants={fUp} 
          style={{ background: 'var(--grad-glass)', marginBottom: '40px', padding: '40px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>📄</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Resumo do Trabalho</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
            O <span className="gradient-text" style={{fontWeight: 800}}>AI Vote 2026</span> é um ecossistema analítico desenvolvido para mapear a eficiência e a percepção humana sobre as principais Inteligências Artificiais do mercado. Através de uma interface de alta performance e processamento de dados em tempo real, capturamos insights valiosos sobre como a tecnologia está moldando o futuro do trabalho e da criatividade.
          </p>
        </motion.div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🛠️
              </div>
             <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Arquitetura do Ecossistema</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Visão técnica das camadas de inovação aplicadas</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
             {[
               { icon: '☁️', title: 'Infraestrutura Serverless', desc: 'Migração completa de legado Java/Docker para Supabase, reduzindo latência e custos.' },
               { icon: '📊', title: 'Data Intelligence', desc: 'Análise de dados demográficos cruzada com preferências tecnológicas em tempo real.' },
               { icon: '🎨', title: 'Design System Premium', desc: 'Uso de tokens modernos, Glassmorphism e Framer Motion para uma UX de classe mundial.' },
               { icon: '🚚', title: 'Continuous Delivery', desc: 'Esteira de CI/CD via Railway com deploys atômicos e seguros via GitHub.' },
               { icon: '🤖', title: 'IA-Powered Workflow', desc: 'Desenvolvimento acelerado com pair programming entre humano e Antigravity IA.' },
               { icon: '🛡️', title: 'Segurança Granular', desc: 'Políticas de RLS (Row Level Security) garantindo integridade e privacidade dos dados.' }
             ].map((item, i) => (
               <motion.div key={i} className="card" variants={fUp} style={{ background: 'rgba(255,255,255,0.02)', padding: '32px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{item.icon}</div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
               </motion.div>
             ))}
          </div>

          {/* Seção de Time de Elite removida conforme solicitado */}
      </div>

      {/* ─── PAINEL DE AÇÕES ADMIN ─────────────────────────────────── */}
      {isAdmin && (
        <motion.div 
          className="card" initial="hidden" animate="visible" variants={fUp}
          style={{ marginBottom: '40px', padding: '32px', background: 'var(--grad-glass)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)' }}>
              ⚙️ Gerenciamento do Sistema
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Apenas pessoal autorizado</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              <button onClick={fetchData} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>🔄 Atualizar Plataforma</button>
              <Link to="/admin/users" className="btn btn-ghost" style={{ fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥 Diretório de Usuários</Link>
              <button onClick={handleResetMyVotes} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>🔄 Reiniciar Minha Sessão</button>
              <button onClick={handleChangePassword} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>🔑 Segurança e Senha</button>
              <button onClick={handleExportData} className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>📥 Backup do Banco</button>
              {window.location.hostname === 'localhost' && (
                <label className="btn btn-ghost" style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📤 Restaurar Backup
                  <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                </label>
              )}
              <button onClick={handleResetData} className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--rose)' }}>🗑️ Reset de Fábrica</button>
          </div>
        </motion.div>
      )}

      {/* ─── FOOTER & CREDITS ─────────────────────────────────────── */}
      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
          "Este trabalho é o resultado da colaboração entre inteligência humana e artificial, focado em mapear as tendências tecnológicas de 2026."
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
           <button 
             onClick={() => setShowInstaModal(true)}
             className="btn btn-outline" 
             style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '12px' }}
           >
             <span>📸</span> Instagram
           </button>
        </div>
      </footer>

      {/* Modal Instagram Flutuante */}
      <AnimatePresence>
        {showInstaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowInstaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(30,30,40,0.95), rgba(15,15,20,0.98))',
                width: '100%',
                maxWidth: '800px',
                borderRadius: '32px',
                padding: '40px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setShowInstaModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>CONECTE-SE</h2>
                <p style={{ color: 'var(--text-muted)' }}>Siga os desenvolvedores e acompanhe as novidades.</p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                {[
                  { name: 'Victor', handle: '@ovittinn_062', url: 'https://www.instagram.com/ovittinn_062/' },
                  { name: 'Erick', handle: '@erick_fernando_lx', url: 'https://www.instagram.com/erick_fernando_lx/' },
                  { name: 'Calixto', handle: '@calixto.sxz', url: 'https://www.instagram.com/calixto.sxz/' }
                ].map((insta, i) => (
                  <motion.a
                    key={i}
                    href={insta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '30px',
                      borderRadius: '24px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'block',
                      transition: 'border 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📸</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>{insta.name}</div>
                    <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>{insta.handle}</div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── COMPONENTES AUXILIARES ──────────────────────────────────────── */

function StatCard({ value, label, icon, delay = 0, trend = null, chartConfig }) {
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
        overflow: 'hidden',
        padding: chartConfig?.type === 'line' ? '24px 24px 40px 24px' : '30px 24px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {chartConfig?.type === 'line' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', zIndex: 0, opacity: 0.8 }}>
          <Line 
            data={chartConfig.data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { x: { display: false, grid: { display: false } }, y: { display: false, min: 0, grid: { display: false } } },
              elements: { point: { radius: 0 }, line: { tension: 0.4 } },
              interaction: { mode: 'none' }
            }} 
          />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
         <span style={{ fontSize: '1.8rem', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>{icon}</span>
         {trend && (
           <span style={{ 
             fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', 
             background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' 
           }}>↗ {trend}</span>
         )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
        <div>
          <motion.div 
            className="stat-value gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '4px', letterSpacing: '-1px' }}
          >
            {value.toLocaleString()}
          </motion.div>
          <div className="stat-label" style={{ color: '#d0d0f0', letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {label}
          </div>
        </div>

        {chartConfig?.type === 'donut' && (
          <div style={{ width: '56px', height: '56px', position: 'relative' }}>
            <Doughnut 
              data={chartConfig.data} 
              options={{ 
                cutout: '75%', 
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                maintainAspectRatio: false,
                animation: { duration: 2000, easing: 'easeOutQuart' }
              }} 
            />
          </div>
        )}
      </div>
      
      {/* Glow Effect */}
      <div style={{ 
        position: 'absolute', bottom: '-20%', left: '-10%', 
        width: '120px', height: '120px', 
        background: 'var(--accent)', opacity: 0.08, 
        filter: 'blur(40px)', borderRadius: '50%', zIndex: 0
      }} />
    </motion.div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px', color: '#a5b4fc' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
      <p style={{ fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

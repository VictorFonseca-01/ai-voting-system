import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

// Novos componentes modulares
import StatCard from '../components/Dashboard/StatCard';
import MainSynthChart from '../components/Dashboard/MainSynthChart';
import DonutChartCard from '../components/Dashboard/DonutChartCard';
import BarChartCard from '../components/Dashboard/BarChartCard';
import AiRankingList from '../components/Dashboard/AiRankingList';

import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI, adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
import { generateAIVotePresentation } from '../services/pptxService';
import { getInstagramUrl } from '../utils/socialUtils';
import AIIcon from '../components/AIIcon.jsx';
import { getFilteredOtherResponses } from '../utils/workAreaUtils';
import { calculateVariation, generateInsight, getProfessionalAnimation } from '../utils/trendUtils';
ChartJS.register(ArcElement, BarElement, PointElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, Title, Filler);

// Paleta de cores vibrantes centrada no DNA do site (Roxo -> Azul)
const PALETTE = ['#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#00f0ff'];

// Variantes de animação para Framer Motion
const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function DashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  

  const [showModal, setShowModal] = useState(false);
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [modalConfig, setModalConfig] = useState({ 
    title: '', 
    message: '', 
    onConfirm: null, 
    type: 'confirm',
    challenge: '', 
    requiresPassword: false,
    severity: 'normal' 
  });
  const [securityInput, setSecurityInput] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPass, setNewPass] = useState('');

  // Refs para captura de gráficos
  const rankingRef = useRef(null);
  const whereRef = useRef(null);
  const workAreaRef = useRef(null);
  const mainSynthRef = useRef(null);

  // Efeito para o countdown de segurança
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChangePassword = () => {
    setModalConfig({
      title: 'Alterar Senha do Administrador',
      type: 'password',
      severity: 'warning'
    });
    setNewPass('');
    setShowModal(true);
  };

  const confirmChangePassword = async () => {
    if (newPass.length < 6) {
      setModalConfig({
        title: 'Senha Curta',
        message: 'A senha deve ter pelo menos 6 caracteres.',
        type: 'alert'
      });
      setShowModal(true);
      return;
    }
    setShowModal(false);
    try {
      await adminAPI.changePassword(newPass);
      setModalConfig({
        title: 'Sucesso! ✅',
        message: 'Sua senha administrativa foi alterada com sucesso.',
        type: 'alert'
      });
      setShowModal(true);
    } catch (err) {
      setModalConfig({
        title: 'Erro de Segurança',
        message: err.response?.data?.error || 'Não foi possível alterar a senha.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };

  // Monitora redimensionamento da janela para reatividade
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const { data: d } = await dashboardAPI.getData();
      setData(d);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Erro ao carregar dados do dashboard. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time Poll: Atualiza a cada 30s (ELITE 4.4)
    const timer = setInterval(() => {
      fetchData(true); // Ativa o isRefreshing para feedback visual
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleResetData = () => {
    setModalConfig({
      title: '⚠️ ZERAR SISTEMA (PROTEÇÃO MÁXIMA)',
      message: 'Todos os votos, questionários e perfis de usuários (exceto o seu) serão APAGADOS PERMANENTEMENTE. Esta ação é irreversível.',
      onConfirm: confirmReset,
      type: 'security',
      challenge: 'RESETAR',
      requiresPassword: true,
      severity: 'danger'
    });
    setSecurityInput('');
    setSecurityPassword('');
    setCountdown(5); // 5 segundos de delay obrigatório
    setShowModal(true);
  };

  const confirmReset = async () => {
    setIsProcessing(true);
    try {
      // Opcional: Validar senha aqui também via API se necessário
      const res = await adminAPI.resetData();
      setShowModal(false);
      setModalConfig({
        title: res.data.simulated ? 'Ação Simulada' : 'Sistema Zerado',
        message: res.data.message || 'Todos os dados foram removidos com sucesso.',
        type: 'alert',
        severity: 'normal'
      });
      setShowModal(true);
      fetchData();
    } catch (err) {
      alert('Erro ao zerar dados: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  
  


  const handleExportData = async () => {
    setModalConfig({
      title: 'Exportar Backup do Sistema',
      message: 'Deseja gerar um arquivo consolidado com todos os dados atuais (votos, respostas e usuários)?',
      onConfirm: confirmExportData,
      type: 'confirm',
      severity: 'normal'
    });
    setShowModal(true);
  };

  const confirmExportData = async () => {
    setShowModal(false);
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
      title: '⚠️ Restaurar Backup (Sobrescrita)',
      message: `ATENÇÃO: Os dados do arquivo "${file.name}" substituirão TODOS os dados atuais. Verifique a procedência do arquivo.`,
      onConfirm: () => confirmImport(file),
      type: 'confirm',
      severity: 'warning'
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

  const handleGeneratePresentation = async () => {
    setIsProcessing(true);
    try {
      // Capturar gráficos como PNG (Base64)
      const rankingImg = rankingRef.current ? await toPng(rankingRef.current, { backgroundColor: '#030305' }) : null;
      const whereImg = whereRef.current ? await toPng(whereRef.current, { backgroundColor: '#030305' }) : null;
      const workAreaImg = workAreaRef.current ? await toPng(workAreaRef.current, { backgroundColor: '#030305' }) : null;

      const chartImages = {
        ranking: rankingImg,
        where: whereImg,
        workArea: workAreaImg
      };

      await generateAIVotePresentation(data, chartImages);
    } catch (err) {
      console.error("Erro ao gerar PPTX:", err);
      setError("Falha ao gerar apresentação. Verifique a captura de gráficos.");
    } finally {
      setIsProcessing(false);
    }
  };

  // =============== MEMOIZAÇÃO DE DADOS E OPÇÕES (TOP LEVEL) ===============
  
  // ELITE PROFESSIONAL 8.0: Cálculo Centralizado de Métricas por Período
  const totalVotes     = data?.votesLast24h || 0;
  const totalResponses = data?.totalResponses || 0;
  const completionRate = data?.totalUniqueVoters ? Math.round((data.totalResponses / data.totalUniqueVoters) * 100) + '%' : '0%';
  const useForStudy    = data?.useForStudy || 0;
  const useForWork     = data?.useForWork || 0;
  const recentVotes    = data?.recentVotes || [];

  const studyRatio = totalResponses ? Math.round((useForStudy / totalResponses) * 100) + '%' : '0%';
  const workRatio = totalResponses ? Math.round((useForWork / totalResponses) * 100) + '%' : '0%';

  const periodMetrics = useMemo(() => {
    const h = data?.history60d || [];
    const current = h.length >= 7 ? h.slice(-7).reduce((a, b) => a + (b?.count || 0), 0) : 0;
    const previous = h.length >= 14 ? h.slice(-14, -7).reduce((a, b) => a + (b?.count || 0), 0) : 0;
    const { percent, trend } = calculateVariation(current, previous);
    const label = "últimos 7 dias";
    return {
      total: current,
      trend: `${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${percent}%`,
      label,
      insight: generateInsight(current, previous, label),
      chart: h.slice(-7).map(d => d?.count || 0)
    }
  }, [data]);

  const groupedRecentVotes = useMemo(() => {
    const groups = {};
    recentVotes.forEach(v => {
      if (!groups[v.userName]) {
        groups[v.userName] = { ...v, aiNames: [v.aiName] };
      } else {
        if (!groups[v.userName].aiNames.includes(v.aiName)) {
          groups[v.userName].aiNames.push(v.aiName);
        }
      }
    });
    return Object.values(groups).slice(0, 5);
  }, [recentVotes]);

  const aiRanking = useMemo(() => {
    return Object.entries(data?.votesByAi || {}).sort((a, b) => b[1] - a[1]);
  }, [data?.votesByAi]);

  // Gráfico Principal (Elite 7.1 Style)
  const totalChartData = useMemo(() => {
    const h = data?.history60d || [];
    return {
      labels: h.map(d => d?.date ? d.date.split('-').reverse().slice(0, 2).join('/') : ''),
      datasets: [
        {
          label: 'Volume de Votos',
          data: h.map(d => d.count),
          borderColor: '#ff00cc',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(255, 0, 204, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 0, 204, 0)');
            return gradient;
          },
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ff00cc',
          pointBorderWidth: 2
        }
      ]
    };
  }, [data]);

  const totalChartOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18, 5, 36, 0.9)',
        titleColor: '#ff00cc',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      }
    }
  }), []);

  const whereDonut = useMemo(() => {
    return {
      labels: Object.keys(data?.whereUseAi || {}),
      datasets: [{
        data: Object.values(data?.whereUseAi || {}),
        backgroundColor: PALETTE, 
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        hoverBorderColor: '#fff',
        hoverBorderWidth: 4,
        hoverOffset: 12
      }]
    };
  }, [data?.whereUseAi]);

  const isSmallScreen = windowWidth < 600;

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
    return Object.entries(data?.workAreas || {}).sort((a, b) => b[1] - a[1]);
  }, [data?.workAreas]);

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
        beginAtZero: true,
        suggestedMax: 5 // Evita achatamento visual
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

  // =========================================================================

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

  // Fallback de Segurança: Se os dados não estiverem disponíveis e não estiver carregando/erro
  if (!data && !loading && !error) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
          <h2 style={{ color: '#fff', marginBottom: '10px' }}>Carregando Dashboard...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sincronizando métricas em tempo real.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: isSmallScreen ? '12px 12px' : '32px 40px' 
    }}>
      
      {/* Modal Customizado */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => !isProcessing && setShowModal(false)}
            style={{ zIndex: 9999 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content" 
              style={{ 
                border: modalConfig.severity === 'danger' ? '2px solid var(--danger)' : 
                       modalConfig.severity === 'warning' ? '2px solid var(--warning)' : '1px solid var(--border)',
                maxWidth: '500px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="accent-line" style={{ 
                  width: '48px', 
                  marginBottom: '12px',
                  background: modalConfig.severity === 'danger' ? 'var(--danger)' : 
                             modalConfig.severity === 'warning' ? 'var(--warning)' : 'var(--accent)'
                }} />
                <h3 style={{ 
                  color: modalConfig.severity === 'danger' ? 'var(--danger)' : '#fff',
                  fontSize: '1.4rem'
                }}>
                  {modalConfig.title}
                </h3>
              </div>
              
              <div className="modal-body" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {modalConfig.type === 'password' ? (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ marginBottom: '16px' }}>Defina uma nova senha de acesso administrativo:</p>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <p style={{ marginBottom: modalConfig.type === 'security' ? '20px' : '0' }}>{modalConfig.message}</p>
                    
                    {modalConfig.type === 'security' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                            1. Confirmação de Intenção
                          </p>
                          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Digite <strong>{modalConfig.challenge}</strong> para habilitar:</p>
                          <input 
                            type="text" 
                            className="form-control"
                            value={securityInput}
                            onChange={(e) => setSecurityInput(e.target.value.toUpperCase())}
                            placeholder={`Digite ${modalConfig.challenge}`}
                            style={{ background: 'rgba(0,0,0,0.3)' }}
                          />
                        </div>

                        {modalConfig.requiresPassword && (
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                              2. Validação de Identidade
                            </p>
                            <input 
                              type="password" 
                              className="form-control"
                              value={securityPassword}
                              onChange={(e) => setSecurityPassword(e.target.value)}
                              placeholder="Digite sua senha de admin"
                              style={{ background: 'rgba(0,0,0,0.3)' }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>
                  Cancelar
                </button>
                
                {modalConfig.type === 'security' ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={modalConfig.onConfirm} 
                    style={{ 
                      background: 'var(--danger)',
                      opacity: (securityInput !== modalConfig.challenge || (modalConfig.requiresPassword && !securityPassword) || countdown > 0) ? 0.5 : 1
                    }}
                    disabled={securityInput !== modalConfig.challenge || (modalConfig.requiresPassword && !securityPassword) || countdown > 0 || isProcessing}
                  >
                    {isProcessing ? 'Processando...' : countdown > 0 ? `Aguarde (${countdown}s)` : 'EXECUTAR AGORA'}
                  </button>
                ) : modalConfig.type === 'password' ? (
                  <button className="btn btn-primary" onClick={confirmChangePassword} disabled={isProcessing}>
                    {isProcessing ? 'Salvando...' : 'Confirmar Alteração'}
                  </button>
                ) : modalConfig.type === 'confirm' ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={modalConfig.onConfirm} 
                    style={{ background: modalConfig.severity === 'warning' ? 'var(--warning)' : 'var(--accent)' }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Aguarde...' : 'Confirmar Ação'}
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowModal(false)}>OK</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {showInstaModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowInstaModal(false)}
            style={{ zIndex: 10000 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" style={{ maxWidth: '600px', background: '#120524', border: '1px solid #7000ff' }} onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>CONECTE-SE</h2>
                <button onClick={() => setShowInstaModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>
              <p style={{ textAlign: 'center', color: '#d0d0f0', marginBottom: '32px' }}>Siga os desenvolvedores e acompanhe as novidades.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Victor', handle: '@ovittinn_062', link: 'https://instagram.com/ovittinn_062' },
                  { name: 'Erick', handle: '@erick_fernando_lx', link: 'https://instagram.com/erick_fernando_lx' },
                  { name: 'Calixto', handle: '@calixto.sxz', link: 'https://instagram.com/calixto.sxz' },
                  { name: 'Pablo', handle: '@pabl0.hrg', link: 'https://www.instagram.com/pabl0.hrg/' },
                  { name: 'João Lucas', handle: '@joao_lucas01s', link: 'https://www.instagram.com/joao_lucas01s/' },
                  { name: 'Luizinho', handle: '@_luizinho.9', link: 'https://www.instagram.com/_luizinho.9/' },
                  { name: 'Mikael', handle: '@ds_mkl', link: 'https://www.instagram.com/ds_mkl/' }
                ].map((p, idx) => (
                  <motion.a 
                    key={idx} href={p.link} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, background: 'rgba(112,0,255,0.2)' }}
                    style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', 
                      background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(112,0,255,0.3)',
                      textDecoration: 'none', color: '#fff'
                    }}
                  >
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '12px', 
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2397 75%, #ad38e7 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                      boxShadow: '0 8px 20px rgba(220, 39, 67, 0.2)'
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#00f0ff' }}>{p.handle}</div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

               {/* ─── HEADER ─────────────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '40px', flexWrap: 'wrap', gap: '20px'
      }}>
        <div style={{ minWidth: '240px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <motion.div 
              style={{ width: '4px', height: '16px', background: isRefreshing ? '#fbbf24' : 'var(--grad-primary)', borderRadius: '2px' }}
              animate={isRefreshing ? { height: [16, 32, 16], opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <h1 style={{ 
              fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', 
              fontWeight: 800, 
              fontFamily: 'var(--font-display)', 
              margin: 0, 
              lineHeight: 1.2,
              letterSpacing: '-0.5px'
            }}>
              DASHBOARD <span style={{ opacity: 0.5 }}>{(isRefreshing && !loading) ? 'ATUALIZANDO...' : 'GERAL'}</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>
               Visão Geral de Análise
             </p>
             <div style={{ 
               display: 'flex', alignItems: 'center', gap: '6px', 
               background: isRefreshing ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)',
               padding: '2px 8px', borderRadius: '99px',
               border: `1px solid ${isRefreshing ? '#fbbf2444' : '#10b98144'}`
             }}>
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRefreshing ? '#fbbf24' : '#10b981' }}
               />
               <span style={{ fontSize: '0.65rem', color: isRefreshing ? '#fbbf24' : '#10b981', fontWeight: 800 }}>
                 {isRefreshing ? 'SINCRONIZANDO' : `LIVE • ${lastUpdated.toLocaleTimeString()}`}
               </span>
             </div>

          </div>
        </div>
        
        <div className="hide-mobile" style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', 
          padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
           <div style={{ textAlign: 'right' }}>
             <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Perfil</div>
             <div style={{ fontSize: '0.7rem', color: 'var(--accent-light)' }}>{isAdmin ? 'Admin do Sistema' : 'Visualizador Público'}</div>
           </div>
           <div style={{ 
             width: '36px', height: '36px', borderRadius: '10px', background: 'var(--grad-primary)', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
           }}>🏅</div>
        </div>
      </div>

      {/* ─── TOP STATS ──────────────────────────────────────────── */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px', marginBottom: '32px' 
      }}>
        <StatCard 
          value={periodMetrics.total} 
          label={`Votos no Período`} 
          delay={0.1} 
          trend={periodMetrics.trend} 
          comparisonLabel={periodMetrics.label}
          insight={periodMetrics.insight}
          chartConfig={{
            type: 'line',
            data: {
              labels: periodMetrics.chart.map((_, i) => i),
              datasets: [{
                data: periodMetrics.chart,
                borderColor: '#6366f1', borderWidth: 2, tension: 0.5, fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
              }]
            }
          }}
        />
        <StatCard 
          value={totalResponses} label="Participantes Únicos" delay={0.2} trend={completionRate} 
          comparisonLabel="votos totais"
          chartConfig={{
            type: 'line',
            data: {
              labels: ['7', '6', '5', '4', '3', '2', '1'],
              datasets: [{
                data: data?.history60d?.slice(-7).map(d => d.count) || [],
                borderColor: '#06b6d4', borderWidth: 2, tension: 0.5, fill: true,
                backgroundColor: 'rgba(6, 182, 212, 0.1)'
              }]
            }
          }}
        />
        <StatCard 
          value={studyRatio} label="Foco em Estudo" delay={0.3} trend={studyRatio} 
          insight={studyRatio.replace('%', '') > 50 ? "Alta adesão acadêmica detectada." : "Uso equilibrado entre estudo/trabalho."}
          chartConfig={{
            type: 'line',
            data: {
              labels: ['7', '6', '5', '4', '3', '2', '1'],
              datasets: [{
                data: [useForStudy * 0.8, useForStudy * 0.9, useForStudy],
                borderColor: '#10b981', borderWidth: 2, tension: 0.5, fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }]
            }
          }}
        />
        <StatCard 
          value={workRatio} label="Uso Profissional" delay={0.4} trend={workRatio} 
          insight={workRatio.replace('%', '') > 30 ? "Forte tração no mercado corporativo." : "Crescimento gradual no âmbito profissional."}
          chartConfig={{
            type: 'line',
            data: {
              labels: ['7', '6', '5', '4', '3', '2', '1'],
              datasets: [{
                data: [useForWork * 0.7, useForWork * 0.85, useForWork],
                borderColor: '#f43f5e', borderWidth: 2, tension: 0.5, fill: true,
                backgroundColor: 'rgba(244, 63, 94, 0.1)'
              }]
            }
          }}
        />
      </div>

      {/* ─── CHARTS SECTION ─────────────────────────────────────── */}
      <MainSynthChart 
        chartRef={mainSynthRef}
        data={totalChartData} opts={totalChartOpts} 
        totalVotes={totalVotes} totalResponses={totalResponses} 
        useForStudy={useForStudy} useForWork={useForWork}
        trend={periodMetrics.trend}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <DonutChartCard chartRef={whereRef} title="Onde usam IA?" data={whereDonut} options={whereOptions} />
        <BarChartCard chartRef={workAreaRef} title="Área de Atuação principal" data={workAreaBar} options={workAreaOpts} otherData={data?.otherWorkAreas || []} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <AiRankingList chartRef={rankingRef} title="Ranking de Preferência" ranking={aiRanking} palette={PALETTE} />
        
        {/* CTA para Análise Aprofundada */}
        <motion.div 
          variants={fUp}
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(6,182,212,0.1) 100%)', 
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            padding: '40px 20px'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase' }}>Análise Aprofundada das Perguntas</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '300px' }}>
            Explore cruzamentos de dados e insights detalhados de cada pergunta do questionário.
          </p>
          <Link to="/analytics" className="btn btn-primary" style={{ padding: '12px 30px', borderRadius: '12px', fontWeight: 700 }}>
            Visualizar Insights Públicos →
          </Link>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Atividade Recente */}
        <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
            Atividade Recente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Header (Desktop Only) */}
            {!isSmallScreen && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(200px, 1.5fr) 1.2fr 1.2fr 100px', 
                gap: '16px', 
                padding: '0 16px 12px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px'
              }}>
                <div>Participante</div>
                <div>Curso / Especialização</div>
                <div>Instituição / Empresa</div>
                <div style={{ textAlign: 'right' }}>Votos</div>
              </div>
            )}

            {groupedRecentVotes.map((v, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isSmallScreen ? '1fr' : 'minmax(200px, 1.5fr) 1.2fr 1.2fr 100px',
                  gap: isSmallScreen ? '8px' : '16px',
                  alignItems: 'center', 
                  padding: isSmallScreen ? '16px' : '14px 16px',
                  background: 'rgba(255,255,255,0.01)', 
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* 1. Participante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' 
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Link 
                      to={`/admin/users?search=${encodeURIComponent(v.userName)}`}
                      style={{ 
                        color: '#fff', textDecoration: 'none', fontWeight: 800, 
                        fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)' 
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.target.style.color = '#fff'}
                    >
                      {v.userName}
                    </Link>
                    
                    {v.instagram && (
                      <a 
                        href={getInstagramUrl(v.instagram)} 
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#e1306c', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={`Instagram de ${v.userName}`}
                      >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.281.11-.705.24-1.485.276-.844.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Curso */}
                <div style={{ fontSize: '0.8rem', color: '#fff', opacity: 0.8 }}>
                  {isSmallScreen && <span style={{ color: 'var(--accent-light)', fontSize: '0.6rem', fontWeight: 800, marginRight: '6px' }}>CURSO:</span>}
                  {v.userCourse || '—'}
                </div>

                {/* 3. Instituição */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isSmallScreen && <span style={{ color: 'var(--accent-light)', fontSize: '0.6rem', fontWeight: 800, marginRight: '6px' }}>INSTITUIÇÃO:</span>}
                  {v.institution || '—'}
                </div>

                {/* 4. Votos */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: isSmallScreen ? 'flex-start' : 'flex-end', alignItems: 'center' }}>
                  {isSmallScreen && <span style={{ color: 'var(--accent-light)', fontSize: '0.6rem', fontWeight: 800, marginRight: '6px' }}>VOTOS:</span>}
                  {v.aiNames.map(name => <AIIcon key={name} name={name} size={18} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TRABALHO & ARQUITETURA ──────────────────────────────── */}
      <motion.div variants={fUp} className="card" style={{ background: 'var(--grad-glass)', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📄</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>Resumo do Trabalho</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '900px', margin: '0 auto', fontSize: '1.05rem' }}>
          O <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>AI Vote 2026</span> é um ecossistema analítico de elite desenvolvido para mapear a eficiência e a percepção humana sobre as IAs. 
          Alimentado por um <span style={{ color: '#00f0ff', fontWeight: 700 }}>Backend robusto em Java Spring Boot</span> e uma camada de segurança assistida por Inteligência Artificial, capturamos insights valiosos sobre o futuro do trabalho.
        </p>
      </motion.div>

      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--grad-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛠️</div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Arquitetura do Ecossistema</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Visão técnica das camadas de inovação aplicadas</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: '☕', title: 'Infraestrutura Enterprise', desc: 'Backend Java Spring Boot com PostgreSQL, proporcionando segurança, escalabilidade e controle total da lógica.' },
            { icon: '📊', title: 'Data Intelligence', desc: 'Análise de dados demográficos cruzada com preferências tecnológicas em tempo real.' },
            { icon: '🎨', title: 'Design System Premium', desc: 'Uso de tokens modernos, Glassmorphism e Framer Motion para uma UX de classe mundial.' },
            { icon: '🚚', title: 'Continuous Delivery', desc: 'Esteira de CI/CD via Railway com deploys atômicos e seguros via GitHub.' },
            { icon: '🤖', title: 'IA-Powered Workflow', desc: 'Desenvolvimento acelerado com pair programming entre humano e Antigravity IA.' },
            { icon: '🛡️', title: 'Segurança Granular', desc: 'Políticas de RLS (Row Level Security) garantindo integridade e privacidade dos dados.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx} variants={fUp} whileHover={{ y: -5 }}
              className="card" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '20px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ fontSize: '1.5rem' }}>👥</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px' }}>Time de Elite</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { emoji: '🥇', name: 'Victor Fonseca', role: 'PRODUCT VISION & LEAD ARCHITECTURE', desc: 'Líder técnico e Engenheiro Fullstack responsável pela visão estratégica do produto, arquitetura de sistemas escaláveis e integração de modelos de IA.' },
            { emoji: '💻', name: 'Erick Fernando & Gabriel Calixto', role: 'CORE DEV TEAM', desc: 'Engenheiros responsáveis pela lógica de votação resiliente, infraestrutura de alta disponibilidade e performance do ecossistema.' },
            { emoji: '💡', name: 'João Lucas, Luiz, Mikael & Pablo', role: 'RESEARCH & UX', desc: 'Especialistas focados em pesquisa de tendências, experiência do usuário e interface visual centrada no ser humano.' }
          ].map((p, i) => (
            <motion.div key={i} variants={fUp} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{p.emoji}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px' }}>{p.name}</h3>
              <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 800, marginBottom: '16px', letterSpacing: '1px' }}>{p.role}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '24px' }}>
            "Este trabalho é o resultado da colaboração entre inteligência humana e artificial, focado em mapear as tendências tecnológicas de 2026."
        </p>
        <button 
          onClick={() => setShowInstaModal(true)}
          className="btn btn-ghost" 
          style={{ 
            borderRadius: '12px', padding: '10px 20px', border: '1px solid rgba(112,0,255,0.5)',
            display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Instagram
        </button>
      </div>

      {/* ─── ADMIN ACTIONS ───────────────────────────────────────── */}
      {isAdmin && (
        <div className="card" style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '20px' }}>⚙️ ADMINISTRAÇÃO</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button 
                onClick={handleGeneratePresentation} 
                className="btn" 
                data-deployed="true"
                style={{ background: 'var(--grad-primary)', border: 'none', color: '#fff', fontWeight: 800, padding: '12px 24px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)' }}
                disabled={isProcessing}
            >
                {isProcessing ? 'Gerando slides...' : '🚀 Gerar Apresentação de Elite'}
            </button>
            <button onClick={fetchData} className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Atualizar</button>
            <Link to="/admin/users" className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Usuários</Link>
            <button onClick={handleChangePassword} className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Alterar Senha do Administrador</button>
            <button onClick={handleExportData} className="btn btn-ghost" style={{ border: '1px solid #10b981', color: '#10b981' }}>Exportar Backup</button>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', border: '1px solid #fbbf24', color: '#fbbf24' }}>
              Importar Backup
              <input type="file" hidden accept=".json" onChange={handleImportData} />
            </label>
            <button onClick={handleResetData} className="btn" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
              ⚠️ Zerar Sistema
            </button>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        AIVote 2026 © Victor Fonseca & Equipe
      </footer>
    </div>
  );
}

/* ─── COMPONENTES AUXILIARES ──────────────────────────────────────── */


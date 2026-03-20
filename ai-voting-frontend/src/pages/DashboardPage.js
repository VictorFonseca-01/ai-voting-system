import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// Registra os componentes do Chart.js
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// Paleta de cores para os gráficos
const PALETTE = ['#6c63ff','#10d98e','#ff4d6d','#ffb547','#00c4cc','#a78bfa','#f59e0b'];

const SYSTEM_URL = window.location.origin;

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
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
    fetchData();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="page"><div className="spinner" /></div>;

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

      {/* ─── HEADER ───────────────────────────────────────────────── */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>🕵️‍♂️ Painel Administrativo</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas detalhadas e análise de comportamento</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/vote" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            🗳️ Votar
          </Link>
          <Link to="/admin/users" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            👥 Ver Usuários
          </Link>
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

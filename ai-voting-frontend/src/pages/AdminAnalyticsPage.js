import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import AIIcon from '../components/AIIcon.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PALETTE = ['#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#00f0ff'];

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function AdminAnalyticsPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAi, setFilterAi] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  const aiOptions = useMemo(() => {
    return ['Todas', 'ChatGPT', 'Gemini', 'Claude', 'Grok', 'Copilot', 'Meta AI', 'DeepSeek', 'Não utilizo IA'];
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getQuestionnaireReport();
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados analíticos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportCSV = () => {
    const rows = [];
    rows.push(['Pergunta', 'IA', 'Resposta', 'Quantidade']);

    report.forEach(q => {
      q.options.forEach(opt => {
        opt.answers.forEach(ans => {
          rows.push([q.question, opt.ai, ans.label, ans.count]);
        });
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_questionario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header & Filters */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>
            ANALYTICS DO <span className="gradient-text">QUESTIONÁRIO</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Análises detalhadas cruzando respostas com IAs selecionadas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>Filtro por IA</label>
                <select 
                    value={filterAi} 
                    onChange={(e) => setFilterAi(e.target.value)}
                    style={{ 
                        background: '#0d0d12', color: '#fff', border: '1px solid var(--border)', 
                        padding: '10px 16px', borderRadius: '10px', minWidth: '180px',
                        outline: 'none'
                    }}
                >
                    {aiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            
            <div style={{ alignSelf: 'flex-end' }}>
                <button onClick={exportCSV} className="btn btn-ghost" style={{ padding: '10px 20px', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                    📥 Exportar CSV
                </button>
            </div>
            
            <div style={{ alignSelf: 'flex-end' }}>
                <button onClick={fetchData} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                    🔄 Atualizar
                </button>
            </div>
        </div>
      </div>

      {/* Grid de Perguntas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '30px' }}>
        {report
          .filter(q => {
            if (filterAi === 'Não utilizo IA') {
              return ['why_not', 'alts', 'interest', 'work_area'].includes(q.id);
            } else if (filterAi === 'Todas') {
              return true;
            } else {
              return ['where_use_ai', 'why_use_ai', 'how_use_ai', 'use_for_study', 'use_for_work', 'work_area'].includes(q.id);
            }
          })
          .map((q, idx) => {
          const isFiltered = filterAi !== 'Todas';
          let relevantData = isFiltered 
            ? q.options.find(o => o.ai === filterAi) 
            : { answers: q.globalAnswers.filter(a => a.count > 0), total: q.totalResponses };

          if (!relevantData) relevantData = { answers: [], total: 0 };
          const hasData = relevantData.answers.length > 0;

          const chartData = {
            labels: relevantData.answers.sort((a,b) => b.count - a.count).map(a => a.label),
            datasets: [{
              label: 'Quantidade',
              data: relevantData.answers.sort((a,b) => b.count - a.count).map(a => a.count),
              backgroundColor: PALETTE,
              borderRadius: 8,
              borderWidth: 0
            }]
          };

          const chartOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#120524',
                titleColor: '#00f0ff',
                bodyColor: '#fff',
                borderColor: 'var(--border)',
                borderWidth: 1
              }
            },
            scales: {
              x: { 
                grid: { color: 'rgba(255,255,255,0.05)' }, 
                ticks: { color: 'rgba(255,255,255,0.5)' },
                beginAtZero: true,
                suggestedMax: 10
              },
              y: { grid: { display: false }, ticks: { color: '#fff', font: { weight: 600 } } }
            }
          };

          return (
            <motion.div 
              key={idx} variants={fUp} initial="hidden" animate="visible"
              className="card"
              style={{ background: 'var(--grad-glass)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{q.question}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isFiltered ? `Filtro: ${filterAi}` : 'Visão Global'} • {relevantData.total} respostas
                    </p>
                  </div>
                </div>
                {isFiltered && <AIIcon name={filterAi} size={32} />}
              </div>

              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hasData ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.3 }}>📊</div>
                    <p>Sem dados registrados para "{filterAi}".</p>
                  </div>
                )}
              </div>

              {/* Tabela de Respostas para melhor legibilidade */}
              <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#120524', zIndex: 1 }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 15px', color: 'var(--text-muted)' }}>Opção/Resposta</th>
                      <th style={{ textAlign: 'center', padding: '10px 15px', color: 'var(--text-muted)', width: '80px' }}>Qtd</th>
                      <th style={{ textAlign: 'center', padding: '10px 15px', color: 'var(--text-muted)', width: '80px' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantData.answers.sort((a,b) => b.count - a.count).map((ans, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '10px 15px', fontWeight: 600 }}>{ans.label}</td>
                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>{ans.count}</td>
                        <td style={{ padding: '10px 15px', textAlign: 'center', color: 'var(--accent)' }}>
                            {relevantData.total > 0 ? ((ans.count / relevantData.total) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                    {relevantData.answers.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma resposta registrada para este critério.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import AIIcon from '../components/AIIcon.jsx';
import { getFilteredOtherResponses, normalize } from '../utils/workAreaUtils';

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
  const [workAreaSearch, setWorkAreaSearch] = useState('');
  const [showWorkAreaSuggestions, setShowWorkAreaSuggestions] = useState(false);
  const [otherWorkAreas, setOtherWorkAreas] = useState({});
  const [showRawExplorer, setShowRawExplorer] = useState(false);
  const [rawSearch, setRawSearch] = useState('');

  const aiOptions = useMemo(() => {
    return ['Todas', 'ChatGPT', 'Gemini', 'Claude', 'Grok', 'Copilot', 'Meta AI', 'DeepSeek', 'Não utilizo IA'];
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, otherWorkAreas } = await adminAPI.getQuestionnaireReport();
      setReport(data);
      setOtherWorkAreas(otherWorkAreas || {});
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

  // USA A FUNÇÃO CENTRALIZADA (ELITE 6.0)
  const { results: workAreaResults } = useMemo(() => {
    return getFilteredOtherResponses({
      otherData: otherWorkAreas,
      activeAiFilter: filterAi,
      searchTerm: workAreaSearch
    });
  }, [otherWorkAreas, filterAi, workAreaSearch]);

  const workAreaSuggestions = useMemo(() => {
    if (!workAreaSearch.trim()) return [];
    return workAreaResults.slice(0, 5);
  }, [workAreaSearch, workAreaResults]);

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

            <div style={{ alignSelf: 'flex-end' }}>
                <button 
                  onClick={() => setShowRawExplorer(!showRawExplorer)} 
                  className="btn btn-ghost" 
                  style={{ 
                    padding: '10px 20px', 
                    border: '1px solid var(--accent)', 
                    color: 'var(--accent)',
                    background: showRawExplorer ? 'var(--accent-glow)' : 'transparent'
                  }}
                >
                    🔍 Explorador de Outros
                </button>
            </div>
        </div>
      </div>

      {/* Grid de Perguntas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))', gap: '30px' }}>
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
          
          // Lógica de Busca específica para Área de Atuação (Back-ported from AnalyticsPage)
          const isWorkArea = q.id === 'work_area';
          const isSearchActive = isWorkArea && workAreaSearch.trim().length > 0;
          
          if (isSearchActive) {
            const term = normalize(workAreaSearch);
            const results = workAreaResults.filter(item => 
              normalize(item.label).includes(term)
            );
            relevantData = {
              answers: results,
              total: results.reduce((acc, curr) => acc + curr.count, 0)
            };
          }

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
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{isSearchActive ? `Análise de "${workAreaSearch}"` : q.question}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isFiltered ? `Filtro: ${filterAi}` : 'Visão Global'} • {relevantData.total} respostas
                    </p>
                  </div>
                </div>

                {/* Busca contextual para Área de Atuação */}
                {isWorkArea && (
                    <div style={{ position: 'relative', width: '250px' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="Pesquisar em 'Outros'..."
                                value={workAreaSearch}
                                onChange={(e) => {
                                    setWorkAreaSearch(e.target.value);
                                    setShowWorkAreaSuggestions(true);
                                }}
                                onFocus={() => setShowWorkAreaSuggestions(true)}
                                style={{
                                    width: '100%', padding: '10px 35px 10px 15px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', fontSize: '0.85rem', outline: 'none'
                                }}
                            />
                            {workAreaSearch && (
                                <button 
                                    onClick={() => setWorkAreaSearch('')}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        
                        <AnimatePresence>
                            {showWorkAreaSuggestions && workAreaSuggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                                        background: '#120524', border: '1px solid var(--border)', borderRadius: '10px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)', overflow: 'hidden'
                                    }}
                                >
                                    {workAreaSuggestions.map((s, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => {
                                                setWorkAreaSearch(s.label);
                                                setShowWorkAreaSuggestions(false);
                                            }}
                                            style={{ padding: '10px 15px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: i < workAreaSuggestions.length -1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between' }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <span style={{ fontWeight: 600 }}>{s.label}</span>
                                            <span style={{ color: 'var(--accent)' }}>{s.count}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {isFiltered && !isWorkArea && <AIIcon name={filterAi} size={32} />}
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

      {/* ─── MODAL EXPLORADOR DE RESPOSTAS BRUTAS (OUTROS) ────────────────── */}
      <AnimatePresence>
        {showRawExplorer && (
          <>
            {/* Backdrop escurecido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRawExplorer(false)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                zIndex: 2000
              }}
            />

            {/* Modal Centralizado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{ 
                position: 'fixed', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: 'min(95vw, 1100px)', height: 'min(90vh, 850px)',
                padding: '40px', 
                background: '#0d0d12',
                border: '2px solid var(--accent)',
                borderRadius: '24px',
                boxShadow: '0 20px 100px rgba(0,0,0,0.8), 0 0 50px rgba(99, 102, 241, 0.2)',
                zIndex: 2001, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column'
              }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '2.5rem' }}>🔍</span> Explorador de Respostas "Outros"
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '5px 0 0 0' }}>Auditando as entradas manuais dos participantes em tempo real.</p>
                    </div>
                    <button 
                        onClick={() => setShowRawExplorer(false)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.5rem', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text"
                            placeholder="Pesquisar em toda a lista (Ex: cargo, empresa, curso...)"
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '20px 25px', borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)', border: '2px solid var(--accent)',
                                color: '#fff', outline: 'none', fontSize: '1.1rem',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.1) inset'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            {workAreaResults.filter(item => !rawSearch || normalize(item.label).includes(normalize(rawSearch))).length} resultados
                        </span>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '15px', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#0d0d12', zIndex: 10 }}>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '15px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem' }}>Resposta Identificada</th>
                                <th style={{ padding: '15px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem' }}>IA Favorita</th>
                                <th style={{ padding: '15px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', textAlign: 'center' }}>Vezes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(workAreaResults || [])
                              .filter(item => !rawSearch || normalize(item.label).includes(normalize(rawSearch)))
                              .sort((a, b) => b.count - a.count)
                              .map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '18px 15px', fontWeight: 600, fontSize: '1rem' }}>{item.label}</td>
                                    <td style={{ padding: '18px 15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {item.ai && item.ai !== 'Todas' ? (
                                                <>
                                                    <AIIcon name={item.ai} size={20} />
                                                    <span style={{ fontSize: '0.9rem' }}>{item.ai}</span>
                                                </>
                                            ) : <span style={{ opacity: 0.4 }}>Não especificado</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 15px', textAlign: 'center' }}>
                                        <span style={{ 
                                            background: 'var(--accent)', color: '#fff', 
                                            padding: '4px 12px', borderRadius: '20px', 
                                            fontWeight: 900, fontSize: '0.9rem'
                                        }}>
                                            {item.count}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(workAreaResults || []).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.2 }}>🔍</div>
                            Nenhuma resposta personalizada encontrada.
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={() => setRawSearch('')} className="btn btn-ghost">Limpar Busca</button>
                    <button onClick={() => setShowRawExplorer(false)} className="btn btn-primary" style={{ padding: '12px 30px' }}>Fechar</button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

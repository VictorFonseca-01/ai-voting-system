import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { getFilteredOtherResponses } from '../../utils/workAreaUtils';
import { dashboardAPI } from '../../api';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function BarChartCard({ title, data, options, chartRef, otherData = [], filterAi = 'Todas' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedResults, setSearchedResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // BUSCA NO BACKEND (ELITE 7.4.0) - Unificado
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchedResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await dashboardAPI.searchOtherWorkAreas(filterAi, searchTerm);
        setSearchedResults(results);
      } catch (err) {
        console.error('Erro na busca dashboard:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterAi]);

  // USA A FUNÇÃO CENTRALIZADA (ELITE 6.0) - Unificando lógica de Dashboard e Analytics
  const { results: filteredResults } = useMemo(() => {
    const dataToProcess = searchTerm.trim() ? searchedResults : otherData[filterAi] || [];
    return getFilteredOtherResponses({
      otherData: dataToProcess,
      activeAiFilter: 'Todas', // Já filtrado no dataToProcess
      searchTerm: '' // Já filtrado no backend
    });
  }, [otherData, filterAi, searchTerm, searchedResults]);

  const totalRaw = useMemo(() => {
    return (otherData[filterAi] || []).length;
  }, [otherData, filterAi]);

  // Filtra as sugestões com base nos resultados já processados pela função única
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredResults.slice(0, 5);
  }, [searchTerm, filteredResults]);

  // Se houver busca ativa, cria os dados do gráfico filtrado usando a estrutura da função central
  const isSearchActive = searchTerm.trim().length > 0;
  
  const finalChartData = useMemo(() => {
    if (!isSearchActive) return data;

    return {
      labels: filteredResults.slice(0, 10).map(r => r.label),
      datasets: [{
        ...data.datasets[0],
        label: `Resultados para "${searchTerm}"`,
        data: filteredResults.slice(0, 10).map(r => r.count),
      }]
    };
  }, [isSearchActive, searchTerm, filteredResults, data]);

  const handleSelectSuggestion = (label) => {
    setSearchTerm(label);
    setShowSuggestions(false);
  };

  return (
    <motion.div ref={chartRef} variants={fUp} className="card" style={{ background: 'transparent !important', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none !important', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
          <h3 style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isSearchActive ? 'Análise de "Outros"' : title}
          </h3>
        </div>

        {/* Campo de Busca Autocomplete - Unificado */}
        <div style={{ position: 'relative', width: '220px' }}>
            <div style={{ position: 'relative' }}>
                <input 
                    type="text"
                    placeholder="Pesquisar em 'Outros'..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{
                        width: '100%', padding: '10px 35px 10px 15px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.85rem', outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        style={{ 
                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', 
                            cursor: 'pointer', fontSize: '0.7rem', width: '20px', height: '20px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--danger)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Dropdown de Sugestões */}
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                            background: '#120524', border: '1px solid var(--border)', borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden'
                        }}
                    >
                        {suggestions.map((s, i) => (
                            <div 
                                key={i}
                                onClick={() => handleSelectSuggestion(s.label)}
                                style={{ padding: '12px 15px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: i < suggestions.length -1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between' }}
                                className="suggestion-item"
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ fontWeight: 600 }}>{s.label}</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{s.count}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {isSearchActive && finalChartData.labels.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</span>
                Nenhum resultado encontrado para "{searchTerm}"
            </div>
        ) : (
            <Bar data={finalChartData} options={options} />
        )}
      </div>

      {isSearchActive && (
          <p style={{ margin: '15px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
             {isSearching ? 'Pesquisando no banco...' : (
               <>Mostrando dados agrupados de <strong>{filteredResults.length}</strong> de <strong>{totalRaw}</strong> respostas "Outros" em <strong>{filterAi}</strong>.</>
             )}
          </p>
      )}
    </motion.div>
  );
}


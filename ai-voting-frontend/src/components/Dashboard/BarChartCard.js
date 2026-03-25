import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { aggregateItems, normalize } from '../../utils/workAreaUtils';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function BarChartCard({ title, data, options, chartRef, otherData = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Agrega todos os dados de "Outros" para sugestões e análise
  const otherAggregated = useMemo(() => {
    return aggregateItems(otherData);
  }, [otherData]);

  // Filtra as sugestões com base no termo digitado
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = normalize(searchTerm);
    return otherAggregated
      .filter(item => normalize(item.label).includes(term))
      .slice(0, 5);
  }, [searchTerm, otherAggregated]);

  // Se houver busca ativa, cria os dados do gráfico filtrado
  const isSearchActive = searchTerm.trim().length > 0;
  
  const filteredData = useMemo(() => {
    if (!isSearchActive) return data;

    const term = normalize(searchTerm);
    const results = otherAggregated.filter(item => 
       normalize(item.label).includes(term)
    );

    return {
      labels: results.map(r => r.label),
      datasets: [{
        ...data.datasets[0],
        label: `Resultados para "${searchTerm}"`,
        data: results.map(r => r.count),
      }]
    };
  }, [isSearchActive, searchTerm, otherAggregated, data]);

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

        {/* Campo de Busca Autocomplete */}
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
                        width: '100%', padding: '8px 32px 8px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }}
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
                                style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', borderBottom: i < suggestions.length -1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between' }}
                                className="suggestion-item"
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                <span>{s.label}</span>
                                <span style={{ opacity: 0.4 }}>{s.count}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {isSearchActive && filteredData.labels.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</span>
                Nenhum resultado encontrado para "{searchTerm}"
            </div>
        ) : (
            <Bar data={filteredData} options={options} />
        )}
      </div>

      {isSearchActive && (
          <p style={{ margin: '15px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
             Mostrando dados agrupados de <strong>{otherData.length}</strong> respostas abertas.
          </p>
      )}
    </motion.div>
  );
}

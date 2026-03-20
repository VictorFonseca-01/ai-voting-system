import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { votesAPI } from '../api';

// IAs disponíveis para votação
const AI_OPTIONS = [
  { name: 'ChatGPT',       emoji: '🤖', color: '#10a37f' },
  { name: 'Claude',        emoji: '🟠', color: '#d97557' },
  { name: 'Gemini',        emoji: '✨', color: '#4285f4' },
  { name: 'Grok',          emoji: '⚡', color: '#1da1f2' },
  { name: 'Meta AI',       emoji: '🔵', color: '#0866ff' },
  { name: 'Copilot',       emoji: '🪟', color: '#00adef' },
  { name: 'DeepSeek',      emoji: '🧠', color: '#4d6eff' },
  { name: 'Não utilizo IA / Outra',emoji: '🚫', color: '#6b7280' },
];

export default function VotePage() {
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [myVotes, setMyVotes] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Remove o checkStatus inicial já que não há mais login para votantes
  useEffect(() => {
    setCheckLoading(false);
  }, []);

  // Alterna seleção de uma IA (máx. 2)
  const toggleAI = (aiName) => {
    if (success) return;
    setError('');
    setSelected(prev => {
      if (prev.includes(aiName)) {
        return prev.filter(n => n !== aiName);
      }
      if (prev.length >= 2) {
        setError('Você só pode votar em 2 IAs. Remova uma seleção antes de adicionar outra.');
        return prev;
      }
      return [...prev, aiName];
    });
  };

  // Pula direto para o questionário após confirmar as IAs
  const confirmSubmit = () => {
    sessionStorage.setItem('selectedIAs', JSON.stringify(selected));
    window.location.href = '/questionnaire';
  };

  const handleSubmit = () => {
    if (selected.length !== 2) {
      setError('Selecione 2 IAs para continuar.');
      return;
    }
    setShowConfirm(true);
    setSuccess(false); // Ensure success state is reset when attempting a new submission
  };

  // Permite edição dos votos
  const handleEdit = () => {
    setHasVoted(false);
    setSelected(myVotes);
    setSuccess(false);
  };

  if (checkLoading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Modal de Confirmação */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <div className="confirm-icon">🤔</div>
            <h2 className="confirm-title">Confirmar Votação?</h2>
            <p className="confirm-text">
              Realmente deseja confirmar as IA's selecionadas: 
              <br/>
              <strong style={{ color: 'var(--accent)' }}>{selected.join(' e ')}</strong>?
            </p>
            <div className="confirm-actions">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Voltar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmSubmit}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Sim, Confirmar!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '40px' }}>
        <div className="accent-line" />
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>🗳️ Votação</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Selecione <strong style={{ color: 'var(--text)' }}>2</strong> IAs que você mais utiliza.
        </p>
      </div>

      {/* Já votou */}
      {hasVoted && !success && (
        <div className="card fade-up" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '8px' }}>Você já votou!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Seus votos foram registrados em: <strong style={{ color: 'var(--accent)' }}>{myVotes.join(' e ')}</strong>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleEdit} className="btn btn-ghost" style={{ background: 'var(--bg-input)' }}>
              ✏️ Editar meus votos
            </button>
            <Link to="/questionnaire" className="btn btn-primary">Responder questionário →</Link>
            <Link to="/dashboard" className="btn btn-ghost">Ver dashboard</Link>
          </div>
        </div>
      )}

      {/* Sucesso após votar */}
      {success && (
        <div className="alert alert-success fade-up" style={{ marginBottom: '24px', fontSize: '1rem', padding: '20px' }}>
          🎉 Votos registrados com sucesso em <strong>{myVotes.join(' e ')}</strong>!
          <br />
          <Link to="/questionnaire" style={{ color: 'var(--success)', marginTop: '8px', display: 'inline-block' }}>
            Agora responda o questionário →
          </Link>
        </div>
      )}

      {/* Grid de IAs */}
      {!hasVoted && (
        <>
          {error && <div className="alert alert-error fade-up">{error}</div>}

          {/* Contador */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px', padding: '12px 20px',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Selecionadas:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: selected.length === 2 ? 'var(--success)' : 'var(--accent)' }}>
              {selected.length} / 2
            </span>
          </div>

          {/* Cards das IAs */}
          <div className="grid-2 fade-up delay-1" style={{ marginBottom: '32px', gap: '12px' }}>
            {AI_OPTIONS.map(({ name, emoji, color }) => {
              const isSelected = selected.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleAI(name)}
                  style={{
                    background: isSelected ? `${color}18` : 'var(--bg-card)',
                    border: `2px solid ${isSelected ? color : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    boxShadow: isSelected ? `0 0 20px ${color}25` : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{emoji}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: isSelected ? color : 'var(--text)', marginBottom: '2px' }}>
                      {name}
                    </p>
                    {isSelected && (
                      <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>✓ Selecionado</span>
                    )}
                  </div>
                  {isSelected && (
                    <div style={{
                      marginLeft: 'auto', width: '24px', height: '24px',
                      borderRadius: '50%', background: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '14px', fontWeight: 700,
                    }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Botão de votar */}
          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={selected.length !== 2 || loading}
            style={{ padding: '16px', fontSize: '1rem' }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 20, height: 20 }} /> Registrando votos...</>
              : selected.length === 2
                ? `🗳️ Confirmar votos: ${selected.join(' + ')}`
                : `Selecione ${2 - selected.length} IA${2 - selected.length > 1 ? 's' : ''} para continuar`
            }
          </button>
        </>
      )}
    </div>
  );
}

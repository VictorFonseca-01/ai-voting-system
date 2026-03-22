import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { votesAPI } from '../api';

const AI_OPTIONS = [
  { id: 'chatgpt', name: 'ChatGPT',   emoji: '🤖',   color: '#10a37f' },
  { id: 'claude',  name: 'Claude',    emoji: '🧠',   color: '#d97557' },
  { id: 'gemini',  name: 'Gemini',    emoji: '✨',   color: '#4285f4' },
  { id: 'grok',    name: 'Grok',      emoji: '⚡',   color: '#1da1f2' },
  { id: 'meta',    name: 'Meta AI',   emoji: '🔵',   color: '#0866ff' },
  { id: 'copilot', name: 'Copilot',   emoji: '🚀',   color: '#00adef' },
  { id: 'deepseek',name: 'DeepSeek',  emoji: '🔍',   color: '#4d6eff' },
  { id: 'none',    name: 'Não utilizo IA', emoji: '🚫',   color: '#6b7280' },
];

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

// BackgroundOrbs removido para visual mais limpo

export default function VotePage() {
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [myVotes, setMyVotes] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Verifica se o usuário já votou no banco de dados
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await votesAPI.checkStatus();
        if (data.hasVoted) {
          setHasVoted(true);
          setMyVotes(data.votes);
        }
      } catch (err) {
        console.error("Erro ao checar status de votação", err);
      } finally {
        setCheckLoading(false);
      }
    };
    checkStatus();
  }, []);

  // Alterna seleção de uma IA (Lógica de Exclusão Mútua)
  const toggleAI = (aiId) => {
    if (success) return;
    setError('');
    setSelected(prev => {
      // Se clicar em "Não utilizo IA"
      if (aiId === 'none') {
        if (prev.includes('none')) return []; // Desmarcar
        return ['none']; // Seleciona apenas "none" e remove as outras
      }

      // Se clicar em qualquer outra IA
      let next = prev.filter(id => id !== 'none'); // Remove "none" se estiver selecionado

      if (next.includes(aiId)) {
        return next.filter(n => n !== aiId);
      }
      
      if (next.length >= 2) {
        setError('Você só pode votar em 2 IAs. Remova uma seleção antes de adicionar outra.');
        return next;
      }
      return [...next, aiId];
    });
  };

  // Pula direto para o questionário após confirmar as IAs
  const confirmSubmit = () => {
    sessionStorage.setItem('selectedIAs', JSON.stringify(selected));
    const isNone = selected.includes('none');
    window.location.href = isNone ? '/questionnaire?type=none' : '/questionnaire';
  };

  const handleSubmit = () => {
    const isNone = selected.includes('none');
    if (!isNone && selected.length !== 2) {
      setError('Selecione 2 IAs para continuar (ou selecione "Não utilizo IA").');
      return;
    }
    setShowConfirm(true);
    setSuccess(false);
  };

  // Permite edição dos votos
  const handleEdit = () => {
    setHasVoted(false);
    setSelected(myVotes);
    setSuccess(false);
  };

  if (checkLoading) {
    return (
      <div className="page" style={{ background: 'var(--bg-main)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Modal de Confirmação Premium */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            className="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 999 }}
          >
            <motion.div 
              className="confirm-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ background: 'var(--grad-glass)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>🌟</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Tudo Certo?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Você escolheu as seguintes Inteligências Artificiais como suas favoritas:
                <br/>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  style={{ marginTop: '16px', fontWeight: 800, fontSize: '1.4rem' }}
                  className="gradient-text"
                >
                  {selected.map(id => AI_OPTIONS.find(o => o.id === id)?.name).join(' & ')}
                </motion.div>
              </p>
              <div className="confirm-actions" style={{ gap: '16px' }}>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setShowConfirm(false)}
                  style={{ padding: '14px 30px' }}
                >
                  Revisar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={confirmSubmit}
                  style={{ padding: '14px 40px', background: 'var(--grad-primary)', border: 'none' }}
                >
                  {loading ? 'Processando...' : 'Confirmar e Continuar →'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div 
            style={{ width: '80px', height: '5px', background: 'linear-gradient(90deg, #ff4d4d, #f9cb28)', borderRadius: '2.5px', margin: '0 auto 24px' }}
            animate={{ width: [60, 100, 60] }} transition={{ duration: 4, repeat: Infinity }}
          />
                <h2 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                  Votação de Elite
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 40px', fontWeight: 500 }}>
                  Selecione as <strong style={{color: '#fff'}}>duas</strong> interfaces que melhor atendem suas necessidades diárias.
                </p>
        </motion.div>

        {/* Status: Já votou */}
        {hasVoted && !success && (
          <motion.div 
            className="card" initial="hidden" animate="visible" variants={fUp}
            style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--grad-glass)' }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '24px', filter: 'drop-shadow(0 0 15px var(--success))' }}>🏆</div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Voto Registrado</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
              Suas escolhas atuais: <span className="gradient-text" style={{ fontWeight: 800 }}>{myVotes.join(' & ')}</span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleEdit} className="btn btn-ghost" 
                style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 28px' }}
              >
                ✏️ Editar Escolhas
              </button>
              <Link to="/questionnaire" className="btn btn-primary" style={{ padding: '14px 32px' }}>Responder Pesquisa →</Link>
              <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '14px 28px' }}>Ver Dashboard</Link>
            </div>
          </motion.div>
        )}

        {/* Grid de IAs */}
        {!hasVoted && (
          <>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="alert alert-error" style={{ marginBottom: '24px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contador Premium */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '32px', padding: '20px 32px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Progresso da Seleção
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${(selected.length / 2) * 100}%` }}
                    style={{ height: '100%', background: 'var(--grad-vibrant)' }}
                  />
                </div>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 800, 
                  fontSize: '2rem', 
                  color: selected.length === 2 ? 'var(--success)' : '#fff',
                  minWidth: '100px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'baseline',
                  gap: '4px'
                }}>
                  {selected.length} <span style={{ fontSize: '1.2rem', opacity: 0.3, fontWeight: 400 }}>/ 2</span>
                </span>
              </div>
            </motion.div>

            {/* Cards das IAs (Pill Format like Mockup) */}
            <motion.div 
              initial="hidden" animate="visible" variants={stagger}
              style={{ 
                marginBottom: '60px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '16px', 
                justifyContent: 'center',
                maxWidth: '600px',
                margin: '0 auto 60px'
              }}
            >
              {AI_OPTIONS.map(({ id, name, emoji, color }, idx) => {
                const isSelected = selected.includes(id);
                return (
                  <motion.button
                    key={id}
                    variants={fUp}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleAI(id)}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${color}33 0%, rgba(255,255,255,0.05) 100%)` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '999px',
                      padding: '12px 24px',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isSelected ? `0 0 20px ${color}44` : 'none'
                    }}
                  >
                    <span style={{ 
                      fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      filter: isSelected ? `drop-shadow(0 0 15px ${color})` : 'none'
                    }}>
                      {emoji}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {name}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* CTA Votar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <button
                className="btn btn-primary btn-full"
                onClick={handleSubmit}
                disabled={(selected.length !== 2 && !selected.includes('none')) || loading}
                style={{ 
                  padding: '20px', fontSize: '1.1rem', borderRadius: '20px',
                  background: (selected.length === 2 || selected.includes('none')) ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                  border: 'none', fontWeight: 800, boxShadow: (selected.length === 2 || selected.includes('none')) ? '0 10px 30px rgba(99, 102, 241, 0.3)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: (selected.length === 2 || selected.includes('none')) ? 'pointer' : 'not-allowed'
                }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 24, height: 24 }} /> Processando...</>
                  : (selected.length === 2 || selected.includes('none'))
                      ? 'Confirmar Votos →' 
                      : 'Selecione suas Opções'}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

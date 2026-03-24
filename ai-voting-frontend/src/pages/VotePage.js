import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { votesAPI } from '../api';
import AIIcon from '../components/AIIcon';

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
    if (!isNone && (selected.length < 1 || selected.length > 2)) {
      setError('Selecione pelo menos 1 IA e no máximo 2 para continuar (ou selecione "Não utilizo IA").');
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
              style={{ background: 'var(--grad-glass)', border: '1px solid rgba(255,255,255,0.1)', padding: 'clamp(20px, 5vw, 40px)' }}
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
                  {(selected || []).map(id => AI_OPTIONS.find(o => o.id === id)?.name).filter(Boolean).join(' & ')}
                </motion.div>
              </p>
              <div className="confirm-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                  Confirmar e Continuar →
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
                <h2 className="gradient-text syne-italic-fix" style={{ 
                  fontSize: 'clamp(2rem, 8vw, 3.5rem)', 
                  fontWeight: 900, 
                  marginBottom: '20px', 
                  letterSpacing: '-2px', 
                  fontFamily: 'var(--font-display)', 
                  textTransform: 'uppercase' 
                }}>
                  Votação de Elite
                </h2>
                <p style={{ 
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
                  color: 'var(--text-muted)', 
                  maxWidth: '650px', 
                  margin: '0 auto 40px', 
                  fontWeight: 500 
                }}>
                  Escolha <strong style={{ color: 'var(--accent-light)' }}>até 2 IAs</strong> que você mais utiliza no seu dia a dia.
                </p>
        </motion.div>

        {/* Status: Já votou */}
        {hasVoted && !success && (
          <motion.div 
            className="card" initial="hidden" animate="visible" variants={fUp}
            style={{ textAlign: 'center', padding: 'clamp(30px, 8vw, 60px) 20px', background: 'var(--grad-glass)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '24px', filter: 'drop-shadow(0 0 15px var(--success))' }}>🏆</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Voto Registrado</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1rem' }}>
              Suas escolhas atuais: <span className="gradient-text" style={{ fontWeight: 800 }}>{(myVotes || []).join(' & ')}</span>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleEdit} className="btn btn-ghost" 
                style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', fontSize: '0.85rem' }}
              >
                ✏️ Editar
              </button>
              <Link to="/questionnaire" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>Pesquisa →</Link>
              <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>Dashboard</Link>
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
                   className="alert alert-error" style={{ marginBottom: '24px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', fontSize: '0.85rem' }}
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
                marginBottom: '32px', padding: '16px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.7rem, 3vw, 0.9rem)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Seleção
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${(selected.length / 2) * 100}%` }}
                    style={{ height: '100%', background: 'var(--grad-vibrant)' }}
                  />
                </div>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 800, 
                  fontSize: '1.5rem', 
                  color: selected.length >= 1 ? 'var(--success)' : '#fff',
                }}>
                  {selected.length} <span style={{ fontSize: '1rem', opacity: 0.3 }}>/ 2</span>
                </span>
              </div>
            </motion.div>

            {/* Cards das IAs (Pill Format like Mockup) */}
            <motion.div 
              initial="hidden" animate="visible" variants={stagger}
              style={{ 
                marginBottom: '40px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'clamp(8px, 2vw, 16px)', 
                justifyContent: 'center',
                maxWidth: '700px',
                margin: '0 auto 40px'
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
                      padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: isSelected ? `0 0 20px ${color}44` : 'none'
                    }}
                  >
                    <span style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <AIIcon name={name} size={32} />
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', color: '#fff' }}>
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
                disabled={(selected.length < 1 && !selected.includes('none'))}
                style={{ 
                  padding: '20px', fontSize: '1.1rem', borderRadius: '20px',
                  background: (selected.length >= 1 || selected.includes('none')) ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                  border: 'none', fontWeight: 800, boxShadow: (selected.length >= 1 || selected.includes('none')) ? '0 10px 30px rgba(99, 102, 241, 0.3)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: (selected.length >= 1 || selected.includes('none')) ? 'pointer' : 'not-allowed'
                }}
              >
                {(selected.length >= 1 || selected.includes('none'))
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

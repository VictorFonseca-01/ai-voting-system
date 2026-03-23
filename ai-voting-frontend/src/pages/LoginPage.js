import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// BackgroundOrbs removido para visual mais limpo

export default function LoginPage() {
  useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.login(form);
      navigate('/vote');
    } catch (err) {
      setError(err.message || 'Erro ao realizar autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ position: 'relative', overflow: 'hidden' }}>
      
      <motion.div 
        initial="hidden" animate="visible" variants={fUp}
        className="card" 
        style={{ 
          width: '100%', maxWidth: '460px', 
          padding: '48px', background: 'var(--grad-glass)',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.div 
            style={{ width: '40px', height: '4px', background: 'var(--grad-primary)', borderRadius: '2px', margin: '0 auto 20px' }}
            animate={{ width: [30, 60, 30] }} transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>
            Acesso
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Inicie sua jornada na pesquisa de elite.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="alert alert-error">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>E-mail corporativo</label>
            <input
              name="email" type="email"
              className="form-control"
              placeholder="exemplo@voto.ai"
              value={form.email} onChange={handleChange} required
              style={{ background: 'rgba(255,255,255,0.03)', padding: '16px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>Chave de acesso</label>
            <div className="password-field-wrap">
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required
                style={{ background: 'rgba(255,255,255,0.03)', padding: '16px' }}
              />
              <button
                type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ height: '100%', top: 0, padding: '0 16px' }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary btn-full"
            disabled={loading}
            style={{ 
              padding: '18px', fontSize: '1.1rem', fontWeight: 800, 
              background: 'var(--grad-vibrant)', border: 'none',
              boxShadow: '0 10px 20px rgba(217, 70, 239, 0.2)'
            }}
          >
            {loading ? <span className="spinner" style={{ width: 22, height: 22 }} /> : 'Entrar Agora'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
             Apenas administradores podem acessar o painel de controle.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

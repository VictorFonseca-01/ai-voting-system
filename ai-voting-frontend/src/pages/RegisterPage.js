import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { validateField } from '../utils/moderation';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: ctxLogin } = useAuth();

  const [form, setForm] = useState({ 
    name: '', email: '', password: '', 
    course: '', institution: '', instagram: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Moderação Multi-campo (Safe Mode)
    const nameErr = validateField('Nome', form.name);
    if (nameErr) { setError(nameErr); return; }
    
    const courseErr = validateField('Curso', form.course);
    if (courseErr) { setError(courseErr); return; }

    const instErr = validateField('Instituição', form.institution);
    if (instErr) { setError(instErr); return; }

    if (form.password.length < 5) {
      setError('A senha deve ter pelo menos 5 caracteres.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register(form);
      ctxLogin(res.data);
      navigate('/vote');
    } catch (err) {
      setError(err.message || 'Falha no cadastro. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px' }}>
      
      <motion.div 
        initial="hidden" animate="visible" variants={fUp}
        className="card" 
        style={{ 
          width: '100%', maxWidth: '500px', 
          padding: '48px', background: 'var(--grad-glass)',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.div 
            style={{ width: '40px', height: '4px', background: 'var(--grad-vibrant)', borderRadius: '2px', margin: '0 auto 20px' }}
            animate={{ width: [30, 60, 30] }} transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Nova Conta
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Junte-se a milhares de mentes brilhantes.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="alert alert-error">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>Identidade</label>
            <input
              name="name" type="text"
              className="form-control"
              placeholder="Nome Completo"
              value={form.name} onChange={handleChange} required
              style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>E-mail</label>
            <input
              name="email" type="email"
              className="form-control"
              placeholder="seu@exemplo.com"
              value={form.email} onChange={handleChange} required
              style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
            />
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>Curso</label>
              <input
                name="course" type="text"
                className="form-control"
                placeholder="Ex: IA"
                value={form.course} onChange={handleChange} required
                style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>Instituição</label>
              <input
                name="institution" type="text"
                className="form-control"
                placeholder="Facul/Empresa"
                value={form.institution} onChange={handleChange} required
                style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>Instagram</label>
            <input
              name="instagram" type="text"
              className="form-control"
              placeholder="@seu_usuario"
              value={form.instagram} onChange={handleChange} required
              style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px', display: 'block' }}>Senha de Segurança</label>
            <div className="password-field-wrap">
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Mínimo 5 caracteres"
                value={form.password} onChange={handleChange} required
                style={{ background: 'transparent !important', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
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
              background: 'var(--grad-primary)', border: 'none',
              marginTop: '12px',
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
            }}
          >
            {loading ? <span className="spinner" style={{ width: 22, height: 22 }} /> : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="divider" style={{ margin: '32px 0', opacity: 0.2 }}>OU</div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem' }}>
          Já possui conta?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 700 }}>
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

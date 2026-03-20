import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', course: '', institution: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Filtro de nomes ofensivos (client-side) ────────────────────
  const BLOCKED_TERMS = [
    'porra','caralho','merda','foder','fodase','foda-se','fodasse',
    'puta','putaria','arrombado','arrombada','cuzao','cuzão',
    'viado','viada','viadinho','bicha','bichona',
    'buceta','boceta','piroca','rola',
    'vsf','fdp','pqp','tnc',
    'desgraçado','desgraçada','corno','cornuda',
    'otario','otário','otaria','otária','babaca','imbecil',
    'idiota','retardado','retardada','mongoloide',
    'vagabundo','vagabunda','safado','safada',
    'filhodaputa','piranha','bosta',
    'punheta','punheteiro','broxa',
    'macaco','macaca','crioulo','crioula',
    'nazist','hitler','fascist',
    'fuck','shit','bitch','asshole','bastard',
    'dick','pussy','cunt','whore','slut',
    'nigger','nigga','faggot','retard',
    'cock','motherfucker','wtf','stfu',
  ];

  const containsProfanity = (text) => {
    const normalized = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z\s]/g, '');
    
    return BLOCKED_TERMS.some(term => {
      const normTerm = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '');
      // Usa word boundaries (\b) para evitar falsos positivos
      const regex = new RegExp(`\\b${normTerm}\\b`, 'i');
      return regex.test(normalized);
    });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (trimmedName.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    if (containsProfanity(trimmedName)) {
      setError('O nome contém termos inadequados. Por favor, escolha outro nome.');
      return;
    }
    const trimmedCourse = form.course.trim();
    if (trimmedCourse.length < 2) {
      setError('O curso deve ter pelo menos 2 caracteres.');
      return;
    }
    if (containsProfanity(trimmedCourse)) {
      setError('O curso contém termos inadequados.');
      return;
    }
    const trimmedInst = form.institution.trim();
    if (trimmedInst.length < 2) {
      setError('A faculdade/empresa deve ter pelo menos 2 caracteres.');
      return;
    }
    if (containsProfanity(trimmedInst)) {
      setError('A faculdade/empresa contém termos inadequados.');
      return;
    }
    if (form.password.length < 5) {
      setError('A senha deve ter pelo menos 5 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.register(form);
      login({ id: data.userId, name: data.name, email: data.email, role: data.role }, data.token);
      navigate('/vote');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card fade-up" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="accent-line" />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Criar conta</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Cadastre-se para participar da votação
          </p>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Seu nome"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Curso</label>
            <input
              id="course"
              name="course"
              type="text"
              className="form-control"
              placeholder="Ex: Engenharia da Computação"
              value={form.course}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="institution">Faculdade ou Empresa</label>
            <input
              id="institution"
              name="institution"
              type="text"
              className="form-control"
              placeholder="Sua instituição"
              value={form.institution}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Mínimo 5 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              minLength={5}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Cadastrando...</> : 'Criar conta'}
          </button>
        </form>

        <div className="divider">ou</div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionnaireAPI } from '../api';

// Opções das perguntas
const WHERE_OPTIONS = ['No trabalho', 'Em casa', 'Na escola/faculdade', 'Em todos os lugares', 'No celular'];
const WHY_OPTIONS   = ['Economizar tempo', 'Aprender mais', 'Resolver problemas', 'Criar conteúdo', 'Entretenimento'];
const HOW_OPTIONS   = ['Digitando perguntas', 'Por voz', 'Enviando imagens', 'Via API/código', 'Dentro de outros apps'];
const WORK_AREAS    = ['Direito', 'Engenharia', 'TI', 'Mecânica', 'Administração', 'Outros'];

export default function QuestionnairePage() {
  const [form, setForm] = useState({
    whereUseAi: '',
    whyUseAi: '',
    howUseAi: '',
    useForStudy: null,
    useForWork: null,
    workArea: '',
    workAreaOther: '',
  });
  const [loading, setLoading]       = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [hasAnswered, setHasAnswered]  = useState(false);
  const [success, setSuccess]        = useState(false);
  const [error, setError]            = useState('');

  // Verifica se o usuário já respondeu
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await questionnaireAPI.getMyResponse();
        if (data.answered) {
          setHasAnswered(true);
          setForm({
            whereUseAi:   data.whereUseAi   || '',
            whyUseAi:     data.whyUseAi     || '',
            howUseAi:     data.howUseAi     || '',
            useForStudy:  data.useForStudy  ?? null,
            useForWork:   data.useForWork   ?? null,
            workArea:     data.workArea     || '',
            workAreaOther:data.workAreaOther || '',
          });
        }
      } catch (e) {
        console.error('Erro ao buscar respostas:', e);
      } finally {
        setCheckLoading(false);
      }
    };
    check();
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    // Validação básica
    if (!form.whereUseAi || !form.whyUseAi || !form.howUseAi ||
        form.useForStudy === null || form.useForWork === null || !form.workArea) {
      setError('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }
    if (form.workArea === 'Outros' && !form.workAreaOther.trim()) {
      setError('Por favor, descreva sua área de atuação.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await questionnaireAPI.submit(form);
      setSuccess(true);
      setHasAnswered(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar respostas.');
    } finally {
      setLoading(false);
    }
  };

  if (checkLoading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '40px' }}>
        <div className="accent-line" />
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>📋 Questionário</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Ajude-nos a entender melhor como as pessoas usam IA. Rápido e anônimo!
        </p>
      </div>

      {/* Sucesso */}
      {success && (
        <div className="alert alert-success fade-up" style={{ marginBottom: '24px', fontSize: '1rem', padding: '20px' }}>
          🎉 Respostas salvas com sucesso! Obrigado pela participação.
          <br />
          <Link to="/dashboard" style={{ color: 'var(--success)', marginTop: '8px', display: 'inline-block' }}>
            Ver os resultados no dashboard →
          </Link>
        </div>
      )}

      {/* Já respondeu - mostra resumo */}
      {hasAnswered && !success && (
        <div className="card fade-up" style={{ marginBottom: '32px', padding: '28px', background: 'rgba(16,217,142,0.05)', borderColor: 'rgba(16,217,142,0.2)' }}>
          <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>✅ Você já respondeu este questionário.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suas respostas podem ser atualizadas abaixo.</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* ─── PERGUNTA 1 ────────────────────────────────────────────── */}
      <QuestionCard num={1} title="Onde você mais usa IA?" delay="delay-1">
        <OptionGrid
          options={WHERE_OPTIONS}
          selected={form.whereUseAi}
          onSelect={(v) => set('whereUseAi', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 2 ────────────────────────────────────────────── */}
      <QuestionCard num={2} title="Por que você usa IA?" delay="delay-1">
        <OptionGrid
          options={WHY_OPTIONS}
          selected={form.whyUseAi}
          onSelect={(v) => set('whyUseAi', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 3 ────────────────────────────────────────────── */}
      <QuestionCard num={3} title="Como você usa IA?" delay="delay-2">
        <OptionGrid
          options={HOW_OPTIONS}
          selected={form.howUseAi}
          onSelect={(v) => set('howUseAi', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 4 ────────────────────────────────────────────── */}
      <QuestionCard num={4} title="Você usa IA para estudar?" delay="delay-2">
        <BooleanToggle
          value={form.useForStudy}
          onChange={(v) => set('useForStudy', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 5 ────────────────────────────────────────────── */}
      <QuestionCard num={5} title="Você usa IA para trabalho?" delay="delay-3">
        <BooleanToggle
          value={form.useForWork}
          onChange={(v) => set('useForWork', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 6 ────────────────────────────────────────────── */}
      <QuestionCard num={6} title="Com o que você trabalha?" delay="delay-3">
        <OptionGrid
          options={WORK_AREAS}
          selected={form.workArea}
          onSelect={(v) => set('workArea', v)}
          columns={3}
        />
        {form.workArea === 'Outros' && (
          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Descreva sua área de atuação..."
              value={form.workAreaOther}
              onChange={(e) => set('workAreaOther', e.target.value)}
            />
          </div>
        )}
      </QuestionCard>

      {/* Botão de envio */}
      <button
        className="btn btn-primary btn-full fade-up"
        style={{ padding: '16px', fontSize: '1rem', marginTop: '8px' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <><span className="spinner" style={{ width: 20, height: 20 }} /> Salvando...</>
          : hasAnswered ? '💾 Atualizar respostas' : '✅ Enviar respostas'
        }
      </button>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ver resultados no dashboard →
        </Link>
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTES ─────────────────────────────────────────────── */

function QuestionCard({ num, title, children, delay = '' }) {
  return (
    <div className={`card fade-up ${delay}`} style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800,
          fontFamily: 'var(--font-display)', flexShrink: 0,
        }}>
          {num}
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function OptionGrid({ options, selected, onSelect, columns = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '8px',
    }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          style={{
            padding: '10px 14px',
            background: selected === opt ? 'var(--accent-glow)' : 'var(--bg-input)',
            border: `1.5px solid ${selected === opt ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: selected === opt ? 'var(--accent-light)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-body)',
            fontWeight: selected === opt ? 600 : 400,
            transition: 'all 0.15s',
            textAlign: 'left',
          }}
        >
          {selected === opt ? '✓ ' : ''}{opt}
        </button>
      ))}
    </div>
  );
}

function BooleanToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {[{ label: '✅ Sim', val: true }, { label: '❌ Não', val: false }].map(({ label, val }) => (
        <button
          key={label}
          onClick={() => onChange(val)}
          style={{
            flex: 1, padding: '14px',
            background: value === val
              ? (val ? 'rgba(16,217,142,0.12)' : 'rgba(255,77,109,0.1)')
              : 'var(--bg-input)',
            border: `2px solid ${value === val
              ? (val ? 'var(--success)' : 'var(--danger)')
              : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: value === val ? (val ? 'var(--success)' : '#ff8fa3') : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: value === val ? 700 : 400,
            fontFamily: 'var(--font-display)',
            transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

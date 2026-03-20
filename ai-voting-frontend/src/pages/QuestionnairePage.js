import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participationAPI } from '../api';

// Opções das perguntas
const WHERE_OPTIONS = ['No trabalho', 'Em casa', 'Na escola/faculdade', 'No celular', 'Todas as alternativas'];
const WHY_OPTIONS   = ['Economizar tempo', 'Aprender mais', 'Resolver problemas', 'Criar conteúdo', 'Entretenimento', 'Todas as alternativas'];
const HOW_OPTIONS   = ['Digitando perguntas', 'Por voz', 'Enviando imagens', 'Via API/código', 'Dentro de outros apps', 'Todas as alternativas'];
const WORK_AREAS    = ['Direito', 'Engenharia', 'TI', 'Mecânica', 'Administração', 'Outros'];

// Lista de cursos da faculdade
const COURSES = [
  'Administração', 'Agronomia', 'Análise e Desenvolvimento de Sistemas', 'Arquitetura e Urbanismo',
  'Banco de Dados', 'Biomedicina', 'Ciências da Computação', 'Ciências Contábeis', 'Ciências Econômicas',
  'Design Gráfico', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Civil', 'Engenharia da Computação',
  'Engenharia de Controle e Automação', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção',
  'Engenharia de Software', 'Estética e Cosmética', 'Farmácia', 'Fisioterapia', 'Gastronomia', 'Gestão Comercial',
  'Gestão da Qualidade', 'Gestão de Recursos Humanos', 'Gestão Financeira', 'Jornalismo', 'Logística', 'Marketing',
  'Nutrição', 'Pedagogia', 'Podologia', 'Processos Químicos', 'Psicologia', 'Publicidade e Propaganda',
  'Sistemas de Informação', 'Terapia Ocupacional', 'Outro (Digitar)'
];

export default function QuestionnairePage() {
  const [form, setForm] = useState({
    fullName: '',
    course: '',
    customCourse: '',
    institution: '',
    instagram: '',
    whereUseAi: [],
    whyUseAi: [],
    howUseAi: [],
    useForStudy: null,
    useForWork: null,
    workArea: '',
    workAreaOther: '',
  });
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]        = useState(false);
  const [error, setError]            = useState('');
  const [selectedIAs, setSelectedIAs] = useState([]);

  // Recupera as IAs selecionadas no passo anterior
  useEffect(() => {
    const saved = sessionStorage.getItem('selectedIAs');
    if (saved) {
      setSelectedIAs(JSON.parse(saved));
    }
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // Lógica de seleção (Limita 2 ou Todas)
  const handleMultiSelect = (key, option) => {
    const current = [...form[key]];
    const isAll = option === 'Todas as alternativas';

    if (isAll) {
      // Se clicou em "Todas", tira o resto ou desmarca se já tava
      if (current.includes(option)) {
        set(key, []);
      } else {
        set(key, [option]);
      }
      return;
    }

    // Se clicar em outra coisa e "Todas" tava marcado, limpa "Todas"
    let updated = current.filter(x => x !== 'Todas as alternativas');

    if (updated.includes(option)) {
      // Desmarca
      updated = updated.filter(x => x !== option);
    } else {
      // Tenta marcar (limite 2)
      if (updated.length < 2) {
        updated.push(option);
      } else {
        // Opcional: rotacionar ou só não deixar? Vou só não deixar.
        // Ou trocar o primeiro pelo novo
        updated.shift();
        updated.push(option);
      }
    }
    set(key, updated);
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!form.fullName || !form.course) {
        setError('Nome Completo e Curso são obrigatórios.');
        return;
    }
    if (form.course === 'Outro (Digitar)' && !form.customCourse.trim()) {
        setError('Por favor, digite o nome do seu curso.');
        return;
    }

    if (form.whereUseAi.length === 0 || form.whyUseAi.length === 0 || form.howUseAi.length === 0 ||
        form.useForStudy === null || form.useForWork === null || !form.workArea) {
      setError('Por favor, responda todas as perguntas do questionário.');
      return;
    }
    
    if (form.workArea === 'Outros' && !form.workAreaOther.trim()) {
      setError('Por favor, descreva sua área de atuação.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepara o Course final
    const finalCourse = form.course === 'Outro (Digitar)' ? form.customCourse : form.course;

    // Prepara dados de Participação Completa
    const payload = {
      aiNames: selectedIAs,
      fullName: form.fullName,
      course: finalCourse,
      institution: form.institution,
      instagram: form.instagram,
      whereUseAi: form.whereUseAi.join(','),
      whyUseAi: form.whyUseAi.join(','),
      howUseAi: form.howUseAi.join(','),
      useForStudy: form.useForStudy,
      useForWork: form.useForWork,
      workArea: form.workArea,
      workAreaOther: form.workAreaOther,
    };

    try {
      await participationAPI.submit(payload);
      // Limpa dados da sessão após sucesso
      sessionStorage.removeItem('selectedIAs');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar participação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '40px' }}>
        <div className="accent-line" />
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>📋 Questionário</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Ajude-nos a entender melhor como as pessoas usam IA. Selecione até 2 opções por pergunta!
        </p>
      </div>

      {/* Overlay de Sucesso / Confirmação Final */}
      {success && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <div className="confirm-icon">🎉</div>
            <h2 className="confirm-title">Resposta Enviada!</h2>
            <p className="confirm-text">
              Sua participação foi registrada com sucesso. 
              <br/>
              Deseja confirmar e ver os resultados?
            </p>
            <div className="confirm-actions" style={{ flexDirection: 'column' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
                ✅ Sim, Tudo certo! (Ver Dashboard)
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* ─── IDENTIFICAÇÃO (Passo 0) ─────────────────────────────────── */}
      <QuestionCard num={0} title="Identificação" delay="fade-in">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Nome Completo <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite seu nome completo"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              style={{ padding: '12px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Curso <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <select
                className="form-control"
                value={form.course}
                onChange={(e) => set('course', e.target.value)}
                style={{ padding: '12px', background: 'var(--bg-input)' }}
            >
                <option value="">Selecione seu curso...</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.course === 'Outro (Digitar)' && (
                <input
                    type="text"
                    className="form-control"
                    placeholder="Digite o nome do seu curso"
                    value={form.customCourse}
                    onChange={(e) => set('customCourse', e.target.value)}
                    style={{ marginTop: '8px', padding: '12px' }}
                />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Sua Instituição/Empresa (Opcional)
                </label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Faculdade, Empresa..."
                    value={form.institution}
                    onChange={(e) => set('institution', e.target.value)}
                    style={{ padding: '12px' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Instagram (Opcional)
                </label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="@seu.perfil"
                    value={form.instagram}
                    onChange={(e) => set('instagram', e.target.value)}
                    style={{ padding: '12px' }}
                />
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* ─── PERGUNTA 1 ────────────────────────────────────────────── */}
      <QuestionCard num={1} title="Onde você mais usa IA? (Escolha até 2)" delay="delay-1">
        <OptionGrid
          options={WHERE_OPTIONS}
          selected={form.whereUseAi}
          onSelect={(v) => handleMultiSelect('whereUseAi', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 2 ────────────────────────────────────────────── */}
      <QuestionCard num={2} title="Por que você usa IA? (Escolha até 2)" delay="delay-1">
        <OptionGrid
          options={WHY_OPTIONS}
          selected={form.whyUseAi}
          onSelect={(v) => handleMultiSelect('whyUseAi', v)}
        />
      </QuestionCard>

      {/* ─── PERGUNTA 3 ────────────────────────────────────────────── */}
      <QuestionCard num={3} title="Como você usa IA? (Escolha até 2)" delay="delay-2">
        <OptionGrid
          options={HOW_OPTIONS}
          selected={form.howUseAi}
          onSelect={(v) => handleMultiSelect('howUseAi', v)}
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
          : '✅ Finalizar e Ver Resultados'
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
  const isSelected = (opt) => Array.isArray(selected) ? selected.includes(opt) : selected === opt;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '8px',
    }}>
      {options.map(opt => {
        const active = isSelected(opt);
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              padding: '10px 14px',
              background: active ? 'var(--accent-glow)' : 'var(--bg-input)',
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: active ? 'var(--accent-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-body)',
              fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
          >
            {active ? '✓ ' : ''}{opt}
          </button>
        );
      })}
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

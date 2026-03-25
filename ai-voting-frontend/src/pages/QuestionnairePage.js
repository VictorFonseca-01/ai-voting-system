import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { participationAPI } from '../api';
import { checkLocalVoteStatus, getFingerprint, getPersistentSessionId } from '../utils/security';

// Opções das perguntas
const WHERE_OPTIONS = ['No trabalho', 'Em casa', 'Na escola/faculdade', 'No celular', 'Todas as alternativas'];
const WHY_OPTIONS   = ['Economizar tempo', 'Aprender mais', 'Resolver problemas', 'Criar conteúdo', 'Entretenimento', 'Todas as alternativas'];
const HOW_OPTIONS   = ['Digitando perguntas', 'Por voz', 'Enviando imagens', 'Via API/código', 'Dentro de outros apps', 'Todas as alternativas'];
const WORK_AREAS    = ['Direito', 'Engenharia', 'TI', 'Mecânica', 'Administração', 'Outros'];

// Termos proibidos para evitar poluição no mural
const PROHIBITED_WORDS = [
  'puto', 'puta', 'caralho', 'porra', 'merda', 'bosta', 'viado', 'cu ', ' cu', 'buceta', 'pinto', 'rola', 
  'cacete', 'foda', 'foder', 'chupa', 'desgraça', 'corno', 'idiota', 'imbecil'
];

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

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

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
  const [error, setError]           = useState('');
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);
  const [selectedIAs, setSelectedIAs] = useState([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const courseDropdownRef = useRef(null);
  const identSectionRef = useRef(null);

  useEffect(() => {
    // 1. Bloqueio Antifraude Preventivo Removido (Conforme nova regra: Sem bloqueio por dispositivo)
    // if (checkLocalVoteStatus()) {
    //   setAlreadyParticipated(true);
    // }

    const saved = sessionStorage.getItem('selectedIAs');
    if (saved) {
      setSelectedIAs(JSON.parse(saved));
    }

    const handleClickOutside = (e) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
        setShowCourseSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleMultiSelect = (key, option) => {
    const current = [...form[key]];
    const isAll = option === 'Todas as alternativas';

    if (isAll) {
      if (current.includes(option)) {
        set(key, []);
      } else {
        set(key, [option]);
      }
      return;
    }

    let updated = current.filter(x => x !== 'Todas as alternativas');
    if (updated.includes(option)) {
      updated = updated.filter(x => x !== option);
    } else {
      if (updated.length < 2) {
        updated.push(option);
      } else {
        updated.shift();
        updated.push(option);
      }
    }
    set(key, updated);
  };

  const validateFullName = (name) => {
    if (!name) return { valid: false, msg: "Por favor, digite seu nome." };
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/);
    
    if (words.length < 2 || trimmed.length < 5) {
      return { valid: false, msg: "Por favor, digite seu Nome e Sobrenome completo." };
    }
    
    const onlyLetters = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!onlyLetters.test(trimmed)) {
      return { valid: false, msg: "O nome deve conter apenas letras." };
    }

    const lowerName = trimmed.toLowerCase();
    const hasProfanity = PROHIBITED_WORDS.some(bad => 
      lowerName.split(/[\s._-]+/).some(word => word === bad || (word.length > 3 && word.includes(bad)))
    );
    if (hasProfanity) {
      return { valid: false, msg: "Por favor, utilize um nome apropriado (sem termos proibidos)." };
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!form.fullName || !form.course) {
      setError('Campos obrigatórios ausentes.');
      setFieldErrors({ fullName: !form.fullName, course: !form.course });
      identSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const nameEval = validateFullName(form.fullName);
    if (!nameEval.valid) {
      setError(nameEval.msg);
      setFieldErrors({ fullName: true });
      identSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const selectedIAs = JSON.parse(sessionStorage.getItem('selectedIAs') || '[]');
      const payload = {
        aiNames: selectedIAs,
        fullName: form.fullName.trim(),
        course: form.course,
        institution: form.institution,
        instagram: form.instagram,
        workArea: form.workArea,
        whereUseAi: form.whereUseAi,
        whyUseAi: form.whyUseAi,
        howUseAi: form.howUseAi,
        useForStudy: form.useForStudy,
        useForWork: form.useForWork,
        workAreaOther: form.workAreaOther
      };
      
      await participationAPI.submit(payload);
      setSuccess(true);
      sessionStorage.removeItem('selectedIAs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Erro ao enviar questionário:", err);
      setError(err.message || "Houve um erro ao registrar sua participação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const isSmallScreen = window.innerWidth < 600;

  if (alreadyParticipated) {
    return (
      <div className="page" style={{ 
        textAlign: 'center', 
        padding: isSmallScreen ? '60px 20px' : '100px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px', filter: 'drop-shadow(0 0 15px var(--accent))' }}>🛡️</div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px', letterSpacing: '-1px' }}>ACESSO RESTRITO</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '40px', margin: '0 auto 40px' }}>
            Este dispositivo já concluiu a participação oficial. 
            Não é permitido votar ou responder ao questionário mais de uma vez para preservar a integridade dos dados.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 30px' }}>Acessar Dashboard</Link>
            <Link to="/" className="btn btn-ghost" style={{ padding: '14px 30px' }}>Voltar ao Início</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', paddingBottom: '100px' }}>
      
      <AnimatePresence>
        {success && (
          <motion.div 
            className="confirm-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ zIndex: 1000 }}
          >
            <motion.div 
              className="confirm-card"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'var(--grad-glass)', padding: '60px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '24px', filter: 'drop-shadow(0 0 20px var(--success))' }}>🌟</div>
              <h2 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px' }}>Missão Cumprida!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '400px' }}>
                Sua voz foi ouvida. Agora, junte-se aos outros e veja as tendências mundiais.
              </p>
              <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', background: 'var(--grad-primary)', border: 'none' }}>
                Explorar Dashboard →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        
        <motion.div initial="hidden" animate="visible" variants={fUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div 
            style={{ width: '60px', height: '4px', background: 'var(--grad-primary)', borderRadius: '2px', margin: '0 auto 20px' }}
            animate={{ width: [40, 80, 40] }} transition={{ duration: 4, repeat: Infinity }}
          />
          <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>
            Ecossistema de Dados
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Contribua para a maior pesquisa sobre inteligência artificial da nossa comunidade.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="alert alert-error" style={{ marginBottom: '32px' }}>
            {error}
          </motion.div>
        )}

        <div ref={identSectionRef}>
          <QuestionCard num={0} title="Identidade Profissional" delay="delay-1">
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px', display: 'block' }}>
                  Nome Completo <span style={{ color: 'var(--accent-light)' }}>*</span>
                </label>
                <input
                  type="text" className="form-control"
                  placeholder="Seu nome completo"
                  value={form.fullName}
                  onChange={(e) => {
                      set('fullName', e.target.value);
                      if (fieldErrors.fullName) setFieldErrors(p => ({...p, fullName: false}));
                  }}
                  style={{ 
                    padding: '16px', borderRadius: '14px', 
                    background: 'var(--bg-input)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    boxShadow: 'none !important' 
                  }}
                />
              </div>

              <div ref={courseDropdownRef} style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px', display: 'block' }}>
                  Curso / Especialização <span style={{ color: 'var(--accent-light)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text" className="form-control"
                        placeholder="Pesquisar curso..."
                        value={form.course}
                        onChange={(e) => {
                            set('course', e.target.value);
                            setShowCourseSuggestions(true);
                            if (fieldErrors.course) setFieldErrors(p => ({...p, course: false}));
                        }}
                        onFocus={() => setShowCourseSuggestions(true)}
                        style={{ 
                            padding: '16px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.03)',
                            borderColor: fieldErrors.course ? '#f43f5e' : 'rgba(255,255,255,0.05)',
                        }}
                    />
                </div>

                <AnimatePresence>
                  {showCourseSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        zIndex: 100, background: '#0d0d12',
                        border: '2px solid var(--accent)',
                        borderRadius: '16px', marginTop: '8px', maxHeight: '250px', overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,1)'
                      }}
                    >
                      {COURSES.filter(c => c !== 'Outro (Digitar)')
                          .filter(c => !form.course || c.toLowerCase().includes(form.course.toLowerCase()))
                          .map(c => (
                              <div
                                  key={c}
                                  onClick={() => { set('course', c); setShowCourseSuggestions(false); }}
                                  style={{
                                      padding: '14px 20px', cursor: 'pointer',
                                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                                      fontSize: '0.95rem', transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                  {c}
                              </div>
                          ))
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid-2" style={{ gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px', display: 'block' }}>Instituição (Opcional)</label>
                  <input
                    type="text" className="form-control"
                    placeholder="Faculdade/Empresa"
                    value={form.institution}
                    onChange={(e) => set('institution', e.target.value)}
                    style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px', display: 'block' }}>Instagram (Opcional)</label>
                  <input
                    type="text" className="form-control"
                    placeholder="@seu.perfil"
                    value={form.instagram}
                    onChange={(e) => set('instagram', e.target.value)}
                    style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none !important' }}
                  />
                </div>
              </div>
            </div>
          </QuestionCard>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {selectedIAs.includes('none') ? (
            <>
              <QuestionCard num={1} title="Motivo do Não Uso" delay="delay-2">
                <OptionGrid
                  options={['Privacidade', 'Falta de Necessidade', 'Incerteza/Erros', 'Complexidade', 'Tradição', 'Custo']}
                  selected={form.whyNot || []}
                  onSelect={(v) => {
                    const curr = form.whyNot || [];
                    set('whyNot', curr.includes(v) ? curr.filter(x => x !== v) : [...curr, v]);
                  }}
                />
              </QuestionCard>
              <QuestionCard num={2} title="Fontes Alternativas" delay="delay-2">
                <OptionGrid
                  options={['Google', 'Livros', 'Cursos', 'Mentores', 'Colegas', 'Própria Base']}
                  selected={form.alts || []}
                  onSelect={(v) => {
                    const curr = form.alts || [];
                    set('alts', curr.includes(v) ? curr.filter(x => x !== v) : [...curr, v]);
                  }}
                />
              </QuestionCard>
              <QuestionCard num={3} title="Interesse Futuro" delay="delay-3">
                <OptionGrid
                  options={['Muito Alto', 'Moderado', 'Baixo', 'Nenhum']}
                  selected={form.interest || ''}
                  onSelect={(v) => set('interest', v)}
                  columns={4}
                />
              </QuestionCard>
            </>
          ) : (
            <>
              <QuestionCard num={1} title="Contexto de Utilização" delay="delay-2">
                <OptionGrid
                  options={WHERE_OPTIONS}
                  selected={form.whereUseAi}
                  onSelect={(v) => handleMultiSelect('whereUseAi', v)}
                />
              </QuestionCard>

              <QuestionCard num={2} title="Motivação Principal" delay="delay-2">
                <OptionGrid
                  options={WHY_OPTIONS}
                  selected={form.whyUseAi}
                  onSelect={(v) => handleMultiSelect('whyUseAi', v)}
                />
              </QuestionCard>

              <QuestionCard num={3} title="Método de Interação" delay="delay-3">
                <OptionGrid
                  options={HOW_OPTIONS}
                  selected={form.howUseAi}
                  onSelect={(v) => handleMultiSelect('howUseAi', v)}
                />
              </QuestionCard>
            </>
          )}

          <div className="grid-2" style={{ gap: '24px' }}>
            <QuestionCard num={4} title="Uso Acadêmico" delay="delay-3">
              <BooleanToggle
                value={form.useForStudy}
                onChange={(v) => set('useForStudy', v)}
              />
            </QuestionCard>

            <QuestionCard num={5} title="Uso Profissional" delay="delay-3">
              <BooleanToggle
                value={form.useForWork}
                onChange={(v) => set('useForWork', v)}
              />
            </QuestionCard>
          </div>

          <QuestionCard num={6} title="Campo de Atuação" delay="delay-4">
            <OptionGrid
              options={WORK_AREAS}
              selected={form.workArea}
              onSelect={(v) => {
                set('workArea', v);
                if (v !== 'Outros') set('workAreaOther', '');
              }}
              columns={3}
            />
            
            <AnimatePresence>
              {form.workArea === 'Outros' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: '20px', overflow: 'hidden' }}
                >
                  <label style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px', display: 'block' }}>
                    Descreva sua área de atuação...
                  </label>
                  <input
                    type="text" className="form-control"
                    placeholder="Ex: Medicina, Artes, Marketing..."
                    value={form.workAreaOther}
                    onChange={(e) => set('workAreaOther', e.target.value)}
                    style={{ 
                      padding: '16px', borderRadius: '14px', 
                      background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: 'none !important'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </QuestionCard>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ marginTop: '40px' }}>
          <button
            className="btn btn-primary btn-full"
            style={{ 
              padding: '22px', fontSize: '1.2rem', fontWeight: 800, 
              background: 'var(--grad-primary)', border: 'none', borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(99, 102, 241, 0.3)'
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 24, height: 24 }} /> Processando Dados...</>
              : '💎 Finalizar Participação de Elite'
            }
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1rem', textDecoration: 'none', opacity: 0.6 }}>
              Pular para Dashboard →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function QuestionCard({ num, title, children, delay = '' }) {
  return (
    <motion.div 
      variants={fUp} initial="hidden" animate="visible"
      className="card" 
      style={{ 
        marginBottom: '0', 
        background: 'rgba(255,255,255,0.02) !important', 
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        boxShadow: 'none !important'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'var(--grad-primary)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800,
          fontFamily: 'var(--font-display)', flexShrink: 0,
        }}>
          {num}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function OptionGrid({ options, selected, onSelect, columns = 2 }) {
  const isSelected = (opt) => Array.isArray(selected) ? selected.includes(opt) : selected === opt;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns === 1 ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
      gap: '12px',
    }}>
      {options.map(opt => {
        const active = isSelected(opt);
        return (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(opt)}
            style={{
              padding: '14px 16px',
              background: active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${active ? 'var(--accent-light)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '16px',
              color: active ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: active ? 700 : 500,
              transition: 'all 0.2s',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'none'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '4px',
              border: `2px solid ${active ? 'var(--accent-light)' : 'rgba(255,255,255,0.2)'}`,
              background: active ? 'var(--accent-light)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: '#fff', transition: 'all 0.2s'
            }}>
              {active && '✓'}
            </div>
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

function BooleanToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {[{ label: 'Sim, utilizo', val: true, icon: '✨' }, { label: 'Não utilizo', val: false, icon: '✖' }].map(({ label, val, icon }) => (
        <motion.button
          key={label}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(val)}
          style={{
            flex: 1, padding: '20px',
            background: value === val
              ? (val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${value === val
              ? (val ? '#10b981' : '#ef4444')
              : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '18px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 700,
            transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: 'none'
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</span>
          {label}
        </motion.button>
      ))}
    </div>
  );
}

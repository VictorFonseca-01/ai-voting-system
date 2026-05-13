import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, label: '🔍 Coletando Dados do Projeto', duration: 1500 },
  { id: 2, label: '📝 Gerando Conteúdo Acadêmico', duration: 2000 },
  { id: 3, label: '📊 Montando Slides Profissionais', duration: 2000 },
  { id: 4, label: '✨ Finalizando Documentos', duration: 1500 }
];

export default function AIPresentationModal({ isOpen, onClose, onGenerate, academicContent }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('both');

  useEffect(() => {
    if (isOpen && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    } else if (currentStep === steps.length) {
      setIsReady(true);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const progress = (currentStep / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="modal-overlay" style={{ zIndex: 10000 }}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="modal-content" style={{ maxWidth: '600px', background: '#0a0a10', border: '1px solid #7000ff33' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', background: 'linear-gradient(45deg, #fff, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Gerador Acadêmico de Elite
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Transformando dados reais em documentação formal ABNT</p>
          </div>

          {!isReady ? (
            <div style={{ padding: '20px 0' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {steps.map((step, idx) => (
                  <div key={step.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    opacity: currentStep >= idx ? 1 : 0.3,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: currentStep > idx ? '#10b981' : currentStep === idx ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                    }}>
                      {currentStep > idx ? '✓' : step.id}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: currentStep === idx ? '#fff' : '#888' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px', padding: '20px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' 
              }}>
                <h4 style={{ color: '#6366f1', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase' }}>Prévia do Conteúdo Acadêmico</h4>
                <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
                  <p><strong>{academicContent.resumo.split(':')[0]}:</strong> {academicContent.resumo.split(':')[1]}</p>
                  <br />
                  <p><strong>{academicContent.introducao.split(':')[0]}:</strong> {academicContent.introducao.split(':')[1]}</p>
                  <br />
                  <p><strong>{academicContent.conclusao.split(':')[0]}:</strong> {academicContent.conclusao.split(':')[1]}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                {['pptx', 'pdf', 'both'].map(format => (
                  <button 
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '10px', 
                      background: selectedFormat === format ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      border: `1px solid ${selectedFormat === format ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                      color: selectedFormat === format ? '#fff' : '#888',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase'
                    }}
                  >
                    {format === 'both' ? 'PPTX + PDF' : format.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2, background: 'linear-gradient(45deg, #6366f1, #a855f7)', border: 'none' }}
                  onClick={() => onGenerate(selectedFormat)}
                >
                  Baixar Apresentação 🚀
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

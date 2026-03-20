import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const SYSTEM_URL = window.location.origin;

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorativo */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Partículas / Estrelas */}
        <div className="particles-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 20% 40%, rgba(108,99,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 60%, rgba(16,217,142,0.04) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%' }}>

          {/* Left — texto */}
          <div className="fade-up hero-text-col">
            <span className="badge badge-accent" style={{ marginBottom: '24px' }}>
              🚀 Sistema de Votação em IA
            </span>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
              Qual IA você mais{' '}
              <span className="gradient-text" style={{ position: 'relative' }}>
                utiliza?
                <svg style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" stroke="var(--accent)" strokeWidth="4" fill="transparent" opacity="0.3" />
                </svg>
              </span>
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
              Vote nas suas 2 IAs favoritas ou mais utilizadas, responda um questionário rápido e visualize insights em tempo real sobre o uso de inteligências artificiais.
            </p>

            {/* Cards de ias */}
            <div className="ai-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '48px' }}>
              {[
                { name: 'ChatGPT', icon: '🤖' },
                { name: 'Claude', icon: '🧠' },
                { name: 'Gemini', icon: '✨' },
                { name: 'Grok', icon: '⚡' },
                { name: 'Meta AI', icon: '🔵' },
                { name: 'Copilot', icon: '🚀' },
                { name: 'DeepSeek', icon: '🔍' },
              ].map((ai, i) => (
                <span 
                  key={ai.name} 
                  className="hover-lift"
                  style={{
                    padding: '10px 20px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '99px',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    animationDelay: `${i * 0.1}s`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{ai.icon}</span>
                  {ai.name}
                </span>
              ))}
            </div>

            <div className="btn-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/vote" className="btn btn-primary">🗳️ Votar agora</Link>
                  {isAdmin && <Link to="/dashboard" className="btn btn-ghost">📊 Ver Dashboard</Link>}
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">Começar agora</Link>
                  <Link to="/login" className="btn btn-ghost">Já tenho conta</Link>
                </>
              )}
            </div>
          </div>

          {/* Right — QR Code */}
          <div className="fade-up delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '320px' }}>
              <div className="accent-line" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Acesse pelo celular</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
                Escaneie o QR Code para abrir o sistema
              </p>

              <div id="qr-print-area" style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                display: 'inline-block',
                marginBottom: '20px',
                boxShadow: '0 0 0 1px var(--border)',
              }}>
                <QRCodeSVG
                  value={SYSTEM_URL}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0a0a0f"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '16px' }}>
                {SYSTEM_URL}
              </p>

              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem', padding: '8px 20px' }}
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>QR Code — AIVote</title>
                      <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        @page { size: A4; margin: 20mm; }
                        body {
                          font-family: 'Segoe UI', Arial, sans-serif;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                          padding: 40px;
                          text-align: center;
                        }
                        .title {
                          font-size: 36px;
                          font-weight: 800;
                          margin-bottom: 12px;
                          color: #0a0a0f;
                        }
                        .subtitle {
                          font-size: 20px;
                          color: #555;
                          margin-bottom: 40px;
                        }
                        .qr-container {
                          border: 4px solid #0a0a0f;
                          border-radius: 20px;
                          padding: 24px;
                          display: inline-block;
                          margin-bottom: 32px;
                          background: #fff;
                        }
                        .url {
                          font-size: 18px;
                          font-family: monospace;
                          color: #333;
                          background: #f0f0f0;
                          padding: 12px 24px;
                          border-radius: 8px;
                          margin-bottom: 32px;
                          letter-spacing: 0.5px;
                        }
                        .instructions {
                          font-size: 16px;
                          color: #777;
                          max-width: 400px;
                          line-height: 1.6;
                        }
                        .emoji { font-size: 28px; margin-bottom: 8px; }
                      </style>
                    </head>
                    <body>
                      <div class="emoji">⚡</div>
                      <div class="title">AIVote</div>
                      <div class="subtitle">Sistema de Votação em Inteligência Artificial</div>
                      <div class="qr-container">
                        ${document.getElementById('qr-print-area').innerHTML}
                      </div>
                      <div class="url">${SYSTEM_URL}</div>
                      <div class="instructions">
                        📱 Aponte a câmera do seu celular para o QR Code acima para acessar o sistema e votar na sua IA favorita!
                      </div>
                    </body>
                    </html>
                  `);
                  // Aumentar o SVG para impressão
                  const svg = printWindow.document.querySelector('svg');
                  if (svg) {
                    svg.setAttribute('width', '300');
                    svg.setAttribute('height', '300');
                  }
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 300);
                }}
              >
                🖨️ Imprimir QR Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '48px' }}>Como funciona</h2>
          <div className="grid-3">
            {[
              { icon: '👤', title: 'Cadastre-se', desc: 'Crie sua conta gratuitamente com nome, email e senha.' },
              { icon: '🗳️', title: 'Vote em 2 IAs', desc: 'Escolha 2 inteligências artificiais que você usa.' },
              { icon: '📊', title: 'Veja os insights', desc: 'Confira gráficos e rankings em tempo real no dashboard.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card shimmer-border stagger-in" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

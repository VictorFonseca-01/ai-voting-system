import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function MainSynthChart({ data, opts, totalVotes, totalResponses, useForStudy, useForWork, chartRef }) {
  const drawCustomFeaturesPlugin = useMemo(() => ({
    id: 'drawCustomFeaturesPlugin',
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const metaPink = chart.getDatasetMeta(0); 
      
      ctx.save();
      // Grid Horizontal Sci-Fi (trilhos)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
         const y = chartArea.top + ((chartArea.bottom - chartArea.top) * (i / 6));
         ctx.beginPath();
         ctx.moveTo(chartArea.left, y);
         ctx.lineTo(chartArea.right, y);
         ctx.stroke();
      }

      // Colunas equalizadoras verticais cibernéticas
      metaPink.data.forEach((element, index) => {
         const distCenter = Math.abs(15 - index); 
         const yOffset = Math.sin(index * 0.5) * 20 + distCenter; 
         ctx.fillStyle = index % 3 === 0 ? 'rgba(255, 0, 204, 0.08)' : 'rgba(255, 255, 255, 0.015)';
         ctx.fillRect(element.x - 6, chartArea.top + Math.abs(yOffset), 12, chartArea.bottom - chartArea.top);
         
         ctx.fillStyle = index % 2 === 0 ? 'rgba(255, 0, 204, 0.6)' : 'rgba(0, 240, 255, 0.5)';
         ctx.fillRect(element.x - 2, chartArea.bottom - 4, 4, 4);
      });
      ctx.restore();
    }
  }), []);

  return (
    <motion.div ref={chartRef} variants={fUp} style={{ 
      background: '#120524', 
      marginBottom: '32px', 
      position: 'relative', 
      overflow: 'hidden',
      borderRadius: '16px',
      padding: '0',
      border: '1px solid rgba(255, 0, 204, 0.1)'
    }}>
      {/* Wave Animation Overlay */}
      <motion.div
        animate={{ x: ['-100%', '100%'], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        style={{
          position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 0, 204, 0.12), transparent)',
          zIndex: 1, pointerEvents: 'none', transform: 'skewX(-25deg)'
        }}
      />

      <div style={{ padding: '32px 32px 10px 32px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#ff00cc', borderRadius: '50%', boxShadow: '0 0 10px #ff00cc' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', color: '#ff00cc', textTransform: 'uppercase' }}>
                Relatório de Síntese Universal
              </span>
            </div>
            <h2 style={{ 
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
              fontWeight: 800, 
              fontFamily: 'var(--font-display)', 
              margin: 0, 
              color: '#fff', 
              letterSpacing: '0',
              lineHeight: 1.3
            }}>
              {totalVotes + totalResponses + useForStudy + useForWork} <span style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 500, letterSpacing: '1px' }}>SCORE GLOBAL</span>
            </h2>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Σ Consolidada: Votos + Questionários + Perfis de Uso
            </p>
          </div>
          <div style={{ textAlign: 'right', minWidth: '100px' }}>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>LIVE</div>
            <div style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+2.4% Estabilidade</div>
          </div>
        </div>
      </div>

      <div style={{ height: '240px', width: '100%', position: 'relative', marginTop: '-20px' }}>
        <Line data={data} options={opts} plugins={[drawCustomFeaturesPlugin]} />
      </div>

      <div style={{ 
        display: 'flex', gap: '32px', padding: '16px 32px', 
        background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '14px', background: '#ff00cc' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>VOLUMETRIA CRÍTICA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '14px', background: '#00f0ff' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>INDEXAÇÃO DE FLUXO</span>
        </div>
      </div>
    </motion.div>
  );
}

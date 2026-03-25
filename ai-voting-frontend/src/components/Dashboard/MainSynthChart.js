import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function MainSynthChart({ data, opts, totalVotes, chartRef, trend, activePeriod }) {
  const isPositive = trend?.includes('+');
  const isNegative = trend?.includes('-');

  const drawCustomFeaturesPlugin = useMemo(() => ({
    id: 'drawCustomFeaturesPlugin',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      
      const meta = chart.getDatasetMeta(0);
      const lastPoint = meta.data[meta.data.length - 1];
      
      if (lastPoint) {
        ctx.save();
        // Glow effect for the last point
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00cc';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff00cc';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }
  }), []);

  const periodLabel = activePeriod === '24h' ? 'Últimas 24h' : activePeriod === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias';

  return (
    <motion.div ref={chartRef} variants={fUp} style={{ 
      background: 'rgba(18, 5, 36, 0.4)', 
      marginBottom: '32px', 
      position: 'relative', 
      overflow: 'hidden',
      borderRadius: '24px',
      padding: '0',
      border: '1px solid rgba(255, 0, 204, 0.08)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ padding: '32px 32px 10px 32px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#ff00cc', borderRadius: '50%', boxShadow: '0 0 10px #ff00cc' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px', color: '#ff00cc', textTransform: 'uppercase' }}>
                Tendência Tecnológica Global
              </span>
            </div>
            <h2 style={{ 
              fontSize: '2.8rem', 
              fontWeight: 800, 
              fontFamily: 'var(--font-display)', 
              margin: 0, 
              color: '#fff', 
              letterSpacing: '-2px',
              lineHeight: 1
            }}>
              {totalVotes} <span style={{ fontSize: '0.9rem', opacity: 0.3, fontWeight: 600, letterSpacing: '1px', marginLeft: '10px' }}>VOTOS TOTALIZADOS</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '12px 0 0 0', fontWeight: 500 }}>
              Análise de fluxo em tempo real: <span style={{ color: '#fff' }}>{periodLabel}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px' }}>LIVE</div>
            <div style={{ 
                color: isPositive ? '#10b981' : isNegative ? '#ef4444' : 'rgba(255,255,255,0.4)', 
                fontSize: '0.75rem', fontWeight: 800, marginTop: '4px'
            }}>
                {isPositive ? '↑' : isNegative ? '↓' : '•'} {trend || 'Estável'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: '350px', width: '100%', position: 'relative', padding: '0 20px 20px 20px' }}>
        <Line data={data} options={{
          ...opts,
          scales: {
            ...opts.scales,
            y: { 
              ...opts.scales?.y, 
              display: true,
              grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
              ticks: { color: 'rgba(255,255,255,0.2)', padding: 10, font: { size: 10 } },
              suggestedMax: Math.max(...data.datasets[0].data) * 1.2 || 10
            },
            x: {
              grid: { display: false }
            }
          }
        }} plugins={[drawCustomFeaturesPlugin]} />
      </div>
    </motion.div>
  );
}

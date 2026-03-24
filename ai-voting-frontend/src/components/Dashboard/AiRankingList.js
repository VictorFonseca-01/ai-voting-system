import React from 'react';
import { motion } from 'framer-motion';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function AiRankingList({ title, ranking, palette, chartRef }) {
  return (
    <motion.div ref={chartRef} variants={fUp} className="card" style={{ background: 'transparent !important', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none !important' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ width: '4px', height: '16px', background: '#d946ef', borderRadius: '2px' }} />
        <h3 style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ranking.map(([name, count], index) => (
          <div key={name} style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
            background: 'transparent !important', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)',
            boxShadow: 'none !important'
          }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '8px', background: palette[index % palette.length], 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: '#000'
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem', color: '#f0f0f8' }}>{name}</div>
            <div style={{ 
              padding: '4px 10px', background: 'transparent !important', color: '#d946ef', 
              borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(217, 70, 239, 0.2)'
            }}>
              {count} VOTOS
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

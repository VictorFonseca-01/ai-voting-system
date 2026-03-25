import React from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function StatCard({ value, label, delay, trend, chartConfig, icon }) {
  return (
    <motion.div 
      variants={fUp} initial="hidden" animate="visible" transition={{ delay }}
      className="card hover-lift" style={{ 
        position: 'relative', 
        background: 'transparent !important', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: '160px',
        boxShadow: 'none !important'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
            fontWeight: 800, 
            fontFamily: 'var(--font-body)', 
            color: '#fff', 
            lineHeight: 1.2, 
            fontVariantNumeric: 'lining-nums tabular-nums',
            letterSpacing: '-0.5px'
          }}>
            {value}
          </div>
        </div>
        {trend && (
          <div style={{ 
            fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', 
            background: trend.includes('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
            color: trend.includes('+') ? '#10b981' : 'var(--text-muted)',
            fontWeight: 700
          }}>
            {trend}
          </div>
        )}
      </div>

      {/* Mini Chart Overlay - Contido nas bordas */}
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '140px', height: '60px', opacity: 0.8 }}>
        {chartConfig && chartConfig.type === 'line' && (
          <Line 
            data={chartConfig.data} 
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { 
                x: { display: false }, 
                y: { 
                    display: false, 
                    suggestedMax: Math.max(...chartConfig.data.datasets[0].data) * 1.5 || 10 
                } 
              },
              elements: { 
                point: { radius: 0 },
                line: { tension: 0.5, borderWidth: 2.5, capStyle: 'round' }
              }
            }} 
          />
        )}
        {chartConfig && chartConfig.type === 'donut' && (
          <Doughnut 
            data={chartConfig.data} 
            options={{
              responsive: true, maintainAspectRatio: false, cutout: '70%',
              plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }} 
          />
        )}
      </div>
    </motion.div>
  );
}

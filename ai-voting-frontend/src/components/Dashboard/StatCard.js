import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function StatCard({ value, label, delay, trend, chartConfig, icon, insight, comparisonLabel }) {
  const isPositive = trend && (trend.includes('+') || !trend.includes('-'));
  const isNegative = trend && trend.includes('-');

  return (
    <motion.div 
      variants={fUp} initial="hidden" animate="visible" transition={{ delay }}
      className="card hover-lift" style={{ 
        position: 'relative', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: '190px',
        boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.1), 0 2px 16px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        padding: '24px'
      }}
    >
      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
            {label}
          </div>
          {trend && (
            <div style={{ 
              fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', 
              background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isPositive ? '#10b981' : '#ef4444',
              border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              fontWeight: 800
            }}>
              {trend}
            </div>
          )}
        </div>

        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          fontFamily: 'var(--font-display)', 
          color: '#fff', 
          lineHeight: 1, 
          letterSpacing: '-1.5px',
          margin: '12px 0'
        }}>
          {value}
        </div>

        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
          vs {comparisonLabel || 'período anterior'}
        </div>

        {insight && (
          <div style={{ 
            fontSize: '0.7rem', 
            color: 'rgba(255,255,255,0.7)', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '10px', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '16px'
          }}>
            {insight}
          </div>
        )}
      </div>

      {/* Mini Gráfico de Fundo */}
      {chartConfig && (
        <div style={{ position: 'absolute', bottom: '-5px', left: '-5%', width: '110%', height: '80px', opacity: 0.25, zIndex: 0, pointerEvents: 'none' }}>
          <Line 
            data={chartConfig.data} 
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { x: { display: false }, y: { display: false } },
              elements: { point: { radius: 0 } }
            }} 
          />
        </div>
      )}
    </motion.div>
  );
}


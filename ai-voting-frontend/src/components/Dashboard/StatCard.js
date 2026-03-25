import React from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function StatCard({ value, label, delay, trend, chartConfig, icon, insight, comparisonLabel }) {
  const isPositive = trend?.includes('+');
  const isNegative = trend?.includes('-');

  return (
    <motion.div 
      variants={fUp} initial="hidden" animate="visible" transition={{ delay }}
      className="card hover-lift" style={{ 
        position: 'relative', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: '180px',
        boxShadow: 'none !important',
        overflow: 'hidden'
      }}
    >
      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            {label}
          </div>
          {trend && (
            <div style={{ 
              fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', 
              background: isPositive ? 'rgba(16, 185, 129, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
              color: isPositive ? '#10b981' : isNegative ? '#ef4444' : 'var(--text-muted)',
              border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : isNegative ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isPositive ? '↑' : isNegative ? '↓' : '•'} {trend}
            </div>
          )}
        </div>

        <div style={{ 
          fontSize: 'clamp(2.2rem, 4vw, 2.8rem)', 
          fontWeight: 900, 
          fontFamily: 'var(--font-display)', 
          color: '#fff', 
          lineHeight: 1, 
          fontVariantNumeric: 'lining-nums tabular-nums',
          letterSpacing: '-1.5px',
          marginBottom: '12px'
        }}>
          {value}
        </div>

        {comparisonLabel && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>
             vs {comparisonLabel}
          </div>
        )}

        {insight && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#fff', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '8px 12px', 
            borderRadius: '8px',
            borderLeft: '3px solid var(--accent)',
            marginTop: '15px'
          }}>
            “{insight}”
          </div>
        )}
      </div>

      {/* Mini Chart Overlay */}
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100%', height: '80px', opacity: 0.3, zIndex: 0, pointerEvents: 'none' }}>
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
                    suggestedMax: Math.max(...chartConfig.data.datasets[0].data) * 1.2 || 10 
                } 
              },
              elements: { 
                point: { radius: 0 },
                line: { tension: 0.6, borderWidth: 2, capStyle: 'round', borderColor: 'var(--accent)' }
              },
              animation: { duration: 3000 }
            }} 
          />
        )}
      </div>
    </motion.div>
  );
}


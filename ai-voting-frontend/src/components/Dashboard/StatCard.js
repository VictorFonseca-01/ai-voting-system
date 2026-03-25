import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function StatCard({ value, label, delay, trend, chartData, icon, insight, comparisonLabel, trendStatus }) {
  const isPositive = trendStatus === 'growth' || (trend && trend.includes('+'));
  const isNegative = trendStatus === 'down' || (trend && trend.includes('-'));
  const isInsufficient = trendStatus === 'insufficient';

  return (
    <motion.div 
      variants={fUp} initial="hidden" animate="visible" transition={{ delay }}
      className="card hover-lift" style={{ 
        position: 'relative', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: '200px',
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
          {!isInsufficient && trend && (
            <div style={{ 
              fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', 
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
          fontSize: '2.5rem', 
          fontWeight: 800, 
          fontFamily: 'var(--font-display)', 
          color: '#fff', 
          lineHeight: 1, 
          fontVariantNumeric: 'lining-nums tabular-nums',
          letterSpacing: '-2px',
          margin: '12px 0'
        }}>
          {value}
        </div>

        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
           {isInsufficient ? 'Dados insuficientes p/ comparação' : `vs ${comparisonLabel || 'período anterior'}`}
        </div>

        {insight && !isInsufficient && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'rgba(255,255,255,0.8)', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '10px 14px', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '20px',
            lineHeight: '1.4'
          }}>
            {insight}
          </div>
        )}
      </div>

      {/* Real Trend Overlay (Bottom) */}
      <div style={{ position: 'absolute', bottom: '-2px', left: '-5%', width: '110%', height: '70px', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}>
        {chartData && chartData.length > 0 && (
          <Line 
            data={{
              labels: chartData.map((_, i) => i),
              datasets: [{
                data: chartData,
                borderColor: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#8b5cf6',
                borderWidth: 2,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 70);
                    gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.4)' : isNegative ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.4)');
                    gradient.addColorStop(1, 'transparent');
                    return gradient;
                },
                tension: 0.4,
                pointRadius: 0
              }]
            }} 
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { x: { display: false }, y: { display: false, beginAtZero: false } },
              animation: { duration: 2000 }
            }} 
          />
        )}
      </div>
    </motion.div>
  );
}


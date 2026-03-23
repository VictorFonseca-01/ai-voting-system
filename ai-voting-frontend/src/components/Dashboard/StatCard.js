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
      className="card" style={{ 
        padding: '24px', position: 'relative', overflow: 'hidden', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: '160px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>
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

      {/* Mini Chart Overlay */}
      <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '120px', height: '80px', opacity: 0.6 }}>
        {chartConfig && chartConfig.type === 'line' && (
          <Line 
            data={chartConfig.data} 
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { x: { display: false }, y: { display: false } },
              elements: { point: { radius: 0 } }
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

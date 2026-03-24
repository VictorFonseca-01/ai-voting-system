import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';

const fUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function DonutChartCard({ title, data, options, chartRef }) {
  return (
    <motion.div ref={chartRef} variants={fUp} className="card" style={{ background: 'transparent !important', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none !important' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--accent-light)', borderRadius: '2px' }} />
        <h3 style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </h3>
      </div>
      <div style={{ height: '260px', position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <Doughnut data={data} options={options} />
      </div>
    </motion.div>
  );
}

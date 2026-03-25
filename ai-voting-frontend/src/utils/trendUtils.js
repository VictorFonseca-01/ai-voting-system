/**
 * Utilitários para análise de tendências e geração de insights (Elite Professional)
 */

/**
 * Calcula a variação entre o período atual e o anterior
 * @param {number} current - Valor do período atual
 * @param {number} previous - Valor do período anterior
 * @returns {Object} { percent, absolute, trend }
 */
export const calculateVariation = (current, previous) => {
  if (!previous || previous === 0) {
    if (!current || current === 0) return { percent: 0, absolute: 0, trend: 'neutral' };
    return { percent: 100, absolute: current, trend: 'up' };
  }
  
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  
  return {
    percent: parseFloat(percent.toFixed(1)),
    absolute: diff,
    trend
  };
};

/**
 * Gera uma frase de insight baseada nos dados
 */
export const generateInsight = (current, previous, periodLabel = 'período anterior') => {
  const { percent, trend } = calculateVariation(current, previous);
  
  if (trend === 'neutral' || Math.abs(percent) < 1) {
    return 'Volume estável em relação ao ' + periodLabel + '.';
  }
  
  const absPercent = Math.abs(percent);
  let adjective = '';
  
  if (absPercent > 30) {
    adjective = trend === 'up' ? 'Crescimento expressivo' : 'Queda acentuada';
  } else if (absPercent > 10) {
    adjective = trend === 'up' ? 'Tendência de alta' : 'Tendência de queda';
  } else {
    adjective = trend === 'up' ? 'Leve subida' : 'Leve oscilação negativa';
  }

  const sign = trend === 'up' ? '+' : '-';
  return `${adjective} de ${sign}${absPercent}% vs ${periodLabel}.`;
};

/**
 * Retorna as configurações de animação premium para o Chart.js
 */
export const getProfessionalAnimation = (type = 'line') => {
  if (type === 'line') {
    return {
      draw: {
        duration: 2000,
        easing: 'easeInOutQuart',
        from: 0,
        to: 1,
        loop: false
      }
    };
  }
  return {
    duration: 1000,
    easing: 'easeOutQuart'
  };
};

/**
 * Formata labels para o período selecionado
 */
export const getPeriodRangeLabels = (period = '7d') => {
  const days = period === '24h' ? 24 : period === '30d' ? 30 : 7;
  const unit = period === '24h' ? 'h' : 'd';
  return Array.from({ length: days }).map((_, i) => `${i}${unit}`);
};

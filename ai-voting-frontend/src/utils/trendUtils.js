/**
 * Utilitários para análise de tendências e geração de insights (Elite Professional 8.0)
 */

/**
 * Calcula a variação entre o período atual e o anterior
 */
export const calculateVariation = (current, previous) => {
  if (!previous || previous === 0) {
    if (!current || current === 0) return { percent: 0, absolute: 0, trend: 'neutral', status: 'insufficient' };
    return { percent: 100, absolute: current, trend: 'up', status: 'growth' };
  }
  
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  
  return {
    percent: parseFloat(percent.toFixed(1)),
    absolute: diff,
    trend,
    status: 'success'
  };
};

/**
 * Gera uma frase de insight baseada nos dados reais
 */
export const generateInsight = (current, previous, periodLabel = 'período anterior') => {
  const { percent, trend, status } = calculateVariation(current, previous);
  
  if (status === 'insufficient') return "Dados insuficientes para comparação.";
  if (trend === 'neutral' || Math.abs(percent) < 1) return `Volume estável em relação ao ${periodLabel}.`;
  
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
 * Recorta o histórico para o período ativo e o anterior equivalente
 * @param {Array} history - Array de dados históricos (ex: history60d)
 * @param {string} period - '24h', '7d', '30d'
 * @returns {Object} { currentSlice, previousSlice, currentTotal, previousTotal }
 */
export const getPeriodSlice = (history = [], period = '7d', hourlyData = []) => {
  if (period === '24h') {
    // Para 24h usamos dados horários se disponíveis
    const current = hourlyData; // Array de 24 números
    const previousLen = Math.floor(hourlyData.length / 2); // Simulação se necessário, ou dados reais do backend
    const currentTotal = current.reduce((a, b) => a + b, 0);
    // Nota: O backend fornece votesPrev24h pronto para o total
    return { currentSlice: current, previousTotal: 0, currentTotal }; // previousTotal será injetado no logic do component
  }

  const days = period === '30d' ? 30 : 7;
  const currentSlice = history.slice(-days);
  const previousSlice = history.slice(-(days * 2), -days);

  const currentTotal = currentSlice.reduce((acc, d) => acc + (d.count || d.value || 0), 0);
  const previousTotal = previousSlice.reduce((acc, d) => acc + (d.count || d.value || 0), 0);

  return {
    currentSlice: currentSlice.map(d => d.count || d.value || 0),
    previousSlice: previousSlice.map(d => d.count || d.value || 0),
    currentTotal,
    previousTotal,
    hasEnoughData: previousSlice.length === days
  };
};

/**
 * Retorna as configurações de animação premium para o Chart.js
 */
export const getProfessionalAnimation = (type = 'line') => {
  return {
    duration: 2000,
    easing: 'easeOutQuart',
    delay: (context) => context.dataIndex * 10,
    from: 0,
    to: 1
  };
};

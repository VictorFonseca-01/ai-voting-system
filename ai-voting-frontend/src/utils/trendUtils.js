/**
 * Utilitários para análise de tendências e geração de insights (Elite 7.1)
 */

/**
 * Calcula a variação entre o período atual e o anterior
 */
export const calculateVariation = (current, previous) => {
  if (!previous || previous === 0) {
    if (!current || current === 0) return { percent: 0, trend: 'neutral' };
    return { percent: 100, trend: 'up' };
  }
  
  const diff = current - previous;
  const percent = Math.abs((diff / previous) * 100);
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  
  return {
    percent: Math.round(percent),
    trend
  };
};

/**
 * Gera uma frase de insight baseada nos dados
 */
export const generateInsight = (current, previous, label) => {
  const { percent, trend } = calculateVariation(current, previous);
  
  if (percent < 5) return `Estabilidade detectada em relação a ${label}.`;
  
  if (trend === 'up') {
    return `Crescimento de +${percent}% em relação a ${label}.`;
  } else if (trend === 'down') {
    return `Redução de -${percent}% em comparação a ${label}.`;
  }
  return `Consistência de performance vs ${label}.`;
};

/**
 * Retorna as configurações de animação consistentes
 */
export const getProfessionalAnimation = (delay = 0) => {
  return {
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { 
      duration: 0.5, 
      delay, 
      ease: [0.16, 1, 0.3, 1] 
    }
  };
};

/**
 * utilitários para normalização e agrupamento de áreas de atuação
 */

const groupedAliases = {
  "Recursos Humanos": ["rh", "r h", "r.h.", "recursos humanos", "setor de rh", "gestão de pessoas", "dp", "departamento pessoal", "human resources"],
  "TI": ["ti", "t.i.", "tecnologia da informacao", "tecnologia da informação", "informatica", "informática", "desenvolvedor", "dev", "programador", "software", "tecnologia", "it", "i.t."],
  "Administração": ["adm", "administracao", "administração", "administrativo", "gestão", "gestao", "management", "administration"],
  "Direito": ["direito", "juridico", "jurídico", "advogado", "advocacia", "law", "legal"],
  "Marketing": ["marketing", "marketing digital", "social media", "comunicação", "comunicacao", "publicidade", "ads", "propaganda"],
  "Educação": ["educação", "educacao", "professor", "ensino", "docente", "pedagogia", "teacher", "education"],
  "Saúde": ["saúde", "saude", "médico", "medico", "enfermagem", "psicologia", "fisioterapia", "dentista", "nutrição", "health"],
  "Engenharia": ["engenharia", "engenheiro", "engineering", "engineer", "civil", "mecânica", "elétrica"],
  "Design": ["design", "designer", "ux", "ui", "criativo", "artes", "arts"]
};

/**
 * Normaliza um texto para comparação
 */
export const normalize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/gi, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Espaços múltiplos em um só
    .trim();
};

/**
 * Retorna o nome canônico de uma área com base nos aliases
 */
export const getCanonicalName = (rawText) => {
  const normalized = normalize(rawText);
  if (!normalized) return null;

  for (const [canonical, aliases] of Object.entries(groupedAliases)) {
    if (aliases.some(alias => {
      const normAlias = normalize(alias);
      // Case 1: Exact match
      if (normalized === normAlias) return true;
      // Case 2: Starts with + space (to avoid 'ti' in 'tiradentes')
      if (normalized.startsWith(normAlias + ' ')) return true;
      // Case 3: Ends with + space
      if (normalized.endsWith(' ' + normAlias)) return true;
      // Case 4: Contains as a whole word
      if (normalized.includes(' ' + normAlias + ' ')) return true;
      return false;
    })) {
      return canonical;
    }
  }

  // Se não encontrar no mapa, retorna o texto original com a primeira letra maiúscula
  return rawText.trim().charAt(0).toUpperCase() + rawText.trim().slice(1);
};

/**
 * Agrega uma lista de strings brutas em itens com contagem e rótulo canônico
 */
export const aggregateItems = (rawStrings) => {
  const counts = {};
  rawStrings.forEach(s => {
    const canonical = getCanonicalName(s);
    if (canonical) {
      counts[canonical] = (counts[canonical] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

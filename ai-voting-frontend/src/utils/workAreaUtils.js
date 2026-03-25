/**
 * utilitários para normalização e agrupamento de áreas de atuação
 */

const groupedAliases = {
  "Recursos Humanos": ["rh", "r h", "r.h.", "recursos humanos", "setor de rh", "gestão de pessoas", "dp", "departamento pessoal"],
  "TI": ["ti", "t.i.", "tecnologia da informacao", "tecnologia da informação", "informatica", "informática", "desenvolvedor", "dev", "programador", "software", "tecnologia"],
  "Administração": ["adm", "administracao", "administração", "administrativo", "gestão", "gestao"],
  "Direito": ["direito", "juridico", "jurídico", "advogado", "advocacia"],
  "Marketing": ["marketing", "marketing digital", "social media", "comunicação", "comunicacao", "publicidade"],
  "Educação": ["educação", "educacao", "professor", "ensino", "docente", "pedagogia"],
  "Saúde": ["saúde", "saude", "médico", "medico", "enfermagem", "psicologia", "fisioterapia"]
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
    if (aliases.some(alias => normalize(alias) === normalized || normalized.includes(normalize(alias)))) {
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

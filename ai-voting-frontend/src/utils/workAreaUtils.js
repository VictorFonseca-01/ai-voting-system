/**
 * utilitários para normalização e agrupamento de áreas de atuação
 */

const groupedAliases = {
  "Recursos Humanos": ["rh", "r h", "r.h.", "recursos humanos", "setor de rh", "gestão de pessoas", "dp", "departamento pessoal", "human resources", "talent acquisition", "gente e cultura"],
  "TI": ["ti", "t.i.", "tecnologia da informacao", "tecnologia da informação", "informatica", "informática", "desenvolvedor", "dev", "programador", "software", "tecnologia", "it", "i.t.", "suporte", "infra", "sistemas"],
  "Administração": ["adm", "administracao", "administração", "administrativo", "gestão", "gestao", "management", "administration", "secretariado", "financeiro", "comercial"],
  "Direito": ["direito", "juridico", "jurídico", "advogado", "advocacia", "law", "legal", "compliance", "tabelião", "cartório"],
  "Marketing": ["marketing", "marketing digital", "social media", "comunicação", "comunicacao", "publicidade", "ads", "propaganda", "relações públicas", "rp", "growth"],
  "Educação": ["educação", "educacao", "professor", "ensino", "docente", "pedagogia", "teacher", "education", "instrutor", "treinamento", "academia"],
  "Saúde": ["saúde", "saude", "médico", "medico", "enfermagem", "psicologia", "fisioterapia", "dentista", "nutrição", "health", "hospitalar", "clínica", "clinica", "biomedicina"],
  "Engenharia": ["engenharia", "engenheiro", "engineering", "engineer", "civil", "mecânica", "elétrica", "produção", "arquitetura", "urbanismo"],
  "Design": ["design", "designer", "ux", "ui", "criativo", "artes", "arts", "gráfico", "ilustrador", "fotografia", "vídeo", "video"]
};

/**
 * Normaliza um texto para comparação (Trim, Lower, Sin Acentos, Sin Pontuação)
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
  if (!rawText) return null;
  const normalized = normalize(rawText);
  if (!normalized) return null;

  for (const [canonical, aliases] of Object.entries(groupedAliases)) {
    if (aliases.some(alias => {
      const normAlias = normalize(alias);
      if (normalized === normAlias) return true;
      if (normalized.startsWith(normAlias + ' ')) return true;
      if (normalized.endsWith(' ' + normAlias)) return true;
      if (normalized.includes(' ' + normAlias + ' ')) return true;
      return false;
    })) {
      return canonical;
    }
  }

  // Sanitização base: Primeira letra maiúscula
  return rawText.trim().charAt(0).toUpperCase() + rawText.trim().slice(1).toLowerCase();
};

/**
 * FUNÇÃO ÚNICA CENTRALIZADA (ELITE 6.0)
 * Filtra, Pesquisa, Agrupa e Retorna resultados de "Outros" de forma consistente.
 */
export const getFilteredOtherResponses = ({
  otherData,
  activeAiFilter = 'Todas',
  searchTerm = ''
}) => {
  // ETAPA 1 e 2: Dataset base respeitando o Filtro de IA e Recorte de Dados
  let baseList = [];
  if (Array.isArray(otherData)) {
    baseList = otherData;
  } else if (typeof otherData === 'object' && otherData !== null) {
    // Busca prioritária na chave 'Todas' se o filtro for global (Elite 7.3.2 Fix)
    const filter = activeAiFilter || 'Todas';
    baseList = otherData[filter] || [];
  }

  const totalRaw = baseList.length;

  // ETAPA 3, 4, 5 e 7: Seleção, Normalização e Agrupamento (Aliases)
  const counts = {};
  const sourceTerms = {};

  baseList.forEach(raw => {
    // Somente se houver texto
    if (!raw || typeof raw !== 'string' || !raw.trim()) return;

    const canonical = getCanonicalName(raw);
    if (canonical) {
      if (!counts[canonical]) {
        counts[canonical] = 0;
        sourceTerms[canonical] = new Set();
      }
      counts[canonical]++;
      sourceTerms[canonical].add(raw.trim());
    }
  });

  // ETAPA 6: Aplicação da busca textual no termo normalizado
  const term = normalize(searchTerm);
  
  const results = Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      normalizedLabel: normalize(label),
      sourceValues: Array.from(sourceTerms[label]),
      percentage: totalRaw > 0 ? (count / totalRaw) * 100 : 0
    }))
    .filter(item => {
      if (!term) return true;
      // Busca no label canônico ou nos termos originais (ex: 'RH' encontra 'Recursos Humanos')
      return item.normalizedLabel.includes(term) || 
             item.sourceValues.some(sv => normalize(sv).includes(term));
    })
    .sort((a, b) => b.count - a.count);

  const totalMatched = results.reduce((acc, curr) => acc + curr.count, 0);

  return {
    results,
    totalRaw,
    totalMatched
  };
};

/**
 * Agrega uma lista de strings brutas (Simplified version using the core logic)
 */
export const aggregateItems = (rawStrings) => {
  const { results } = getFilteredOtherResponses({ otherData: rawStrings });
  return results.map(r => ({ label: r.label, count: r.count }));
};

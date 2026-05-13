/**
 * Serviço de Geração de Conteúdo Acadêmico via Templates 🎓
 * Versão: 1.0 (Sem IA Externa)
 */

const PROJECT_INFO = {
  name: "AI Vote 2026",
  objective: "Mapear a eficiência e a percepção humana sobre as principais IAs do mercado em 2026.",
  technologies: ["React 18", "Supabase (PostgreSQL)", "Railway", "Framer Motion", "Chart.js", "PptxGenJS", "TailwindCSS/Vanilla CSS"],
  architecture: "Arquitetura cliente-servidor (SPA) com persistência em nuvem (BaaS) e políticas de segurança RLS.",
  methodology: "Metodologia ágil/incremental com foco em UX/UI de alta performance e análise de dados em tempo real.",
  problem: "A falta de dados consolidados sobre a preferência real e o impacto das IAs no fluxo de trabalho e estudo contemporâneo.",
  functionalities: [
    "Votação multidimensional em modelos de IA",
    "Questionário socioeconômico e profissional",
    "Dashboard administrativo em tempo real",
    "Análise de tendências temporais e geográficas",
    "Exportação de relatórios técnicos e acadêmicos"
  ]
};

export const academicTemplateService = {
  
  generateAcademicContent: (dashboardData) => {
    const data = {
      ...PROJECT_INFO,
      metrics: dashboardData
    };

    return {
      resumo: academicTemplateService.generateResumo(data),
      introducao: academicTemplateService.generateIntroducao(data),
      objetivos: academicTemplateService.generateObjetivos(data),
      metodologia: academicTemplateService.generateMetodologia(data),
      desenvolvimento: academicTemplateService.generateDesenvolvimento(data),
      resultados: academicTemplateService.generateResultados(data),
      conclusao: academicTemplateService.generateConclusao(data),
      referencias: academicTemplateService.generateReferencias(data)
    };
  },

  generateResumo: (data) => {
    const techStr = data.technologies.slice(0, 3).join(", ");
    return `RESUMO: O presente trabalho apresenta o desenvolvimento do sistema ${data.name}, uma plataforma analítica desenvolvida com ${techStr} e outras tecnologias modernas. O objetivo central é ${data.objective}. Através de uma interface de alta performance, o sistema coleta votos e dados demográficos, processando ${data.metrics.totalVotes || 0} interações até o momento. As funcionalidades incluem ${data.functionalities.slice(0, 2).join(" e ")}. Os resultados obtidos demonstram uma alta adesão ao sistema e fornecem insights valiosos sobre a adoção de IA no cenário atual.`;
  },

  generateIntroducao: (data) => {
    return `INTRODUÇÃO: Com a rápida evolução da Inteligência Artificial, surge a necessidade de ferramentas que mensurem sua aceitação e eficácia. O ${data.name} surge como uma solução para ${data.problem}. Este relatório detalha a arquitetura, as tecnologias e os resultados alcançados pelo sistema, que visa ${data.objective}`;
  },

  generateObjetivos: (data) => {
    return `OBJETIVOS: O objetivo geral é ${data.objective}. Especificamente, o sistema busca: 1) Prover uma interface intuitiva para votação; 2) Coletar dados sobre o uso de IA em âmbitos acadêmicos e profissionais; 3) Gerar visualizações analíticas em tempo real para tomada de decisão baseada em dados.`;
  },

  generateMetodologia: (data) => {
    return `METODOLOGIA: O desenvolvimento seguiu a ${data.methodology}. A stack tecnológica composta por ${data.technologies.join(", ")} foi selecionada para garantir escalabilidade e segurança. O banco de dados PostgreSQL (via Supabase) foi estruturado com políticas de RLS (Row Level Security) para garantir a integridade e privacidade dos dados dos participantes.`;
  },

  generateDesenvolvimento: (data) => {
    return `DESENVOLVIMENTO: O sistema foi estruturado em camadas: a interface (frontend) em React 18 foca na experiência do usuário, utilizando Framer Motion para animações fluidas. A camada de serviços se integra ao Supabase para operações de CRUD em tempo real. O dashboard administrativo utiliza Chart.js para transformar dados brutos em gráficos informativos, permitindo a análise de ${data.metrics.totalResponses || 0} questionários respondidos.`;
  },

  generateResultados: (data) => {
    const topAi = data.metrics.votesByAi ? Object.entries(data.metrics.votesByAi).sort((a,b) => b[1]-a[1])[0][0] : "N/A";
    const studyPct = data.metrics.totalResponses ? ((data.metrics.useForStudy / data.metrics.totalResponses) * 100).toFixed(1) : 0;
    return `RESULTADOS E DISCUSSÃO: Até a presente data, o sistema registrou ${data.metrics.totalVotes} votos totais de ${data.metrics.totalUniqueVoters} participantes únicos. A ferramenta de IA com maior preferência identificada foi ${topAi}. No contexto de uso, ${studyPct}% dos participantes utilizam IA para fins acadêmicos. Estes dados validam a hipótese de que a IA está profundamente integrada ao cotidiano estudantil e profissional.`;
  },

  generateConclusao: (data) => {
    return `CONCLUSÃO: O projeto ${data.name} atingiu seus objetivos ao criar um ecossistema funcional para análise de dados de IA. Conclui-se que a arquitetura adotada é robusta e capaz de suportar o volume de dados coletados. O trabalho contribui para o mapeamento tecnológico de 2026 e abre caminho para futuras expansões em análise preditiva.`;
  },

  generateReferencias: (data) => {
    return `REFERÊNCIAS: 
    1. REACT. React Documentation. Disponível em: https://react.dev.
    2. SUPABASE. Supabase Docs. Disponível em: https://supabase.com/docs.
    3. PPTXGENJS. PptxGenJS Documentation. Disponível em: https://gitbrent.github.io/PptxGenJS/.
    4. ABNT. NBR 14724: Informação e documentação — Trabalhos acadêmicos — Apresentação. Rio de Janeiro, 2011.`;
  }
};

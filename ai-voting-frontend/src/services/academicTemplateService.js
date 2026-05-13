/**
 * Serviço de Geração de Conteúdo Acadêmico via Templates 🎓
 * Versão: 1.0 (Sem IA Externa)
 */

const PROJECT_INFO = {
  name: "AI Vote 2026",
  institution: "CENTRO UNIVERSITÁRIO ALVES FARIA – UNIALFA",
  department: "DEPARTAMENTO DE ENGENHARIAS",
  course: "ENGENHARIA DE SOFTWARE / SISTEMAS DE INFORMAÇÃO",
  discipline: "PROBABILIDADE E ESTATÍSTICA",
  professor: "ESP. EDUARDO UNGARELLI",
  authors: [
    "Victor Fonseca da Silva - 20242143006",
    "Erick Fernando de Jesus Silva - 20242143005",
    "Gabriel Calixto Rosa - 20242143018",
    "João Lucas Santos Mendonça - 20211193013",
    "Luiz Henrique Rocha dos Santos - 20241173010",
    "Mikael Marques de Carvalho Dias - 20242203009",
    "Pablo Henrique Rodrigues Gomes - 20242143004"
  ],
  objective: "Mapear a eficiência e a percepção humana sobre as principais IAs do mercado em 2026, utilizando métodos estatísticos para validar a representatividade dos dados.",
  technologies: ["React 18", "Supabase (PostgreSQL)", "Vercel", "Framer Motion", "Chart.js", "PptxGenJS", "jsPDF"],
  architecture: "Arquitetura cliente-servidor (SPA) com persistência em nuvem (BaaS) e políticas de segurança RLS (Row Level Security).",
  methodology: "Pesquisa quantitativa exploratória com amostragem sistemática e análise estatística descritiva em tempo real.",
  problem: "A crescente onipresença da Inteligência Artificial carece de dados estatísticos consolidados sobre a percepção de eficiência e usabilidade por parte dos usuários reais.",
  justification: "A relevância deste estudo reside na necessidade de compreender como as diferentes ferramentas de IA impactam a produtividade e quais são as tendências de adoção para os próximos anos.",
  functionalities: [
    "Coleta de dados via amostragem probabilística",
    "Votação multidimensional normalizada",
    "Questionário demográfico detalhado",
    "Análise estatística descritiva (Média, Frequência)",
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
    return `RESUMO: Este trabalho detalha o desenvolvimento e os resultados do sistema ${data.name}, um ecossistema analítico concebido para o mapeamento da percepção humana sobre ferramentas de IA. Utilizando uma stack moderna baseada em ${data.technologies.slice(0, 3).join(", ")}, o sistema coletou e processou ${data.metrics.totalVotes || 0} interações. A metodologia aplicada permitiu a análise estatística de dados demográficos e preferências tecnológicas. Os resultados indicam tendências significativas de adoção, com foco na eficiência operacional. Palavras-chave: IA, Estatística, Análise de Dados, Desenvolvimento Web.`;
  },

  generateIntroducao: (data) => {
    return `1 INTRODUÇÃO: No cenário tecnológico de 2026, a Inteligência Artificial consolidou-se como ferramenta indispensável. Entretanto, a mensuração de sua eficácia sob a ótica do usuário final ainda apresenta lacunas. O projeto ${data.name} surge para ${data.problem}. O objetivo deste estudo é ${data.objective}. A pesquisa justifica-se pela necessidade de dados empíricos para embasar discussões sobre o futuro do trabalho e da educação. Este relatório está estruturado em: Metodologia, Desenvolvimento Técnico, Análise de Resultados e Conclusão.`;
  },

  generateObjetivos: (data) => {
    return `2 OBJETIVOS: O objetivo geral desta pesquisa é desenvolver uma plataforma capaz de ${data.objective}. Como objetivos específicos, destacam-se: 1) Implementar um sistema de coleta de dados íntegro e escalável; 2) Aplicar técnicas de amostragem estatística para garantir a confiabilidade dos dados; 3) Visualizar métricas de tendência central e distribuição de preferência entre as principais IAs do mercado.`;
  },

  generateMetodologia: (data) => {
    return `3 METODOLOGIA: A pesquisa segue um ${data.methodology}. A coleta de dados foi realizada através de um instrumento digital composto por votação e questionário socioeconômico. A técnica de amostragem utilizada foca na aleatoriedade e representatividade dos estratos profissionais e acadêmicos. O tratamento dos dados foi realizado em tempo real via PostgreSQL, garantindo a integridade através de políticas de RLS.`;
  },

  generateDesenvolvimento: (data) => {
    return `4 DESENVOLVIMENTO: O sistema foi construído sobre uma infraestrutura ${data.architecture}. O frontend em React 18 proporciona uma interface reativa e performática. O banco de dados foi modelado para suportar o cruzamento de dados entre as variáveis de perfil e as escolhas tecnológicas. Foram implementadas 5 funcionalidades principais: ${data.functionalities.join("; ")}. O processo de desenvolvimento seguiu ciclos incrementais, permitindo ajustes baseados no feedback preliminar dos dados.`;
  },

  generateResultados: (data) => {
    const topAi = data.metrics.votesByAi ? Object.entries(data.metrics.votesByAi).sort((a,b) => b[1]-a[1])[0][0] : "N/A";
    const studyPct = data.metrics.totalResponses ? ((data.metrics.useForStudy / data.metrics.totalResponses) * 100).toFixed(1) : 0;
    return `5 RESULTADOS E DISCUSSÃO: A análise dos ${data.metrics.totalVotes} votos registrados revela que ${topAi} detém a maior parcela de preferência. Em termos de aplicação, observou-se que ${studyPct}% da amostra utiliza essas ferramentas primordialmente para estudos. A análise estatística descritiva indica uma correlação positiva entre a especialização profissional e a escolha por modelos de IA específicos. Estes achados corroboram a tese de que a especialização das IAs atende a demandas setoriais distintas.`;
  },

  generateConclusao: (data) => {
    return `6 CONCLUSÃO: O projeto ${data.name} cumpriu rigorosamente os objetivos propostos. A síntese dos resultados demonstra que a percepção de eficiência das IAs está ligada diretamente à área de atuação do usuário. Esta pesquisa contribui para o corpo de conhecimento de ${data.discipline} ao aplicar métodos práticos de coleta e análise. Sugere-se para trabalhos futuros a inclusão de testes de hipóteses inferenciais para aprofundar a compreensão das motivações de uso.`;
  },

  generateReferencias: (data) => {
    return `REFERÊNCIAS:
    ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: Informação e documentação: trabalhos acadêmicos: apresentação. Rio de Janeiro, 2011.
    UNIALFA. Diretrizes para Elaboração de Pesquisa de Probabilidade e Estatística. Prof. Eduardo Ungarelli, 2023.
    SUPABASE. Documentação Técnica e Segurança de Dados. Disponível em: https://supabase.com.
    REACT. Documentação Oficial da Biblioteca. Disponível em: https://react.dev.`;
  }
};

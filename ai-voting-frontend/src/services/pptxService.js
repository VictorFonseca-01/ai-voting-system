import pptxgen from "pptxgenjs";

/**
 * Serviço de Geração de Apresentação de Elite - AI VOTE 2026 🚀
 */
export const generateAIVotePresentation = async (data, charts) => {
  const pptx = new pptxgen();

  // Configurações Globais de Design
  const THEME = {
    bg: "030305",
    accent: "6366F1",
    text: "FFFFFF",
    muted: "D0D0F0",
    grad1: "6366F1",
    grad2: "8B5CF6",
  };

  pptx.layout = "LAYOUT_16x9";
  pptx.title = "AI Vote 2026 - Status Report";

  // --- Função Auxiliar: Aplicar Fundo Dark ---
  const applyDarkTheme = (slide) => {
    slide.background = { fill: THEME.bg };
    // Adiciona uma linha de acento no topo
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.05,
      fill: { type: "solid", color: THEME.accent }
    });
  };

  // 1. CAPA
  const s1 = pptx.addSlide();
  s1.background = { fill: THEME.bg };
  s1.addText("AI VOTE 2026", {
    x: 1, y: 2.5, w: 8, h: 1,
    fontSize: 60, bold: true, color: THEME.grad1, fontFace: "Arial Black",
    align: "center"
  });
  s1.addText("Ecossistema Analítico de Elite", {
    x: 1, y: 3.5, w: 8, h: 0.5,
    fontSize: 24, italic: true, color: THEME.text, fontFace: "Arial",
    align: "center"
  });
  s1.addText("Relatório de Inteligência de Dados v1.0", {
    x: 1, y: 5, w: 8, h: 0.3,
    fontSize: 14, color: THEME.muted, align: "center"
  });

  // 2. VISÃO GERAL
  const s2 = pptx.addSlide();
  applyDarkTheme(s2);
  s2.addText("VISÃO GERAL DO PROJETO", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  s2.addText([
    { text: "O AI Vote foi concebido para mapear a eficiência e a percepção humana sobre as principais IAs do mercado.\n\n", options: { fontSize: 18, color: THEME.text } },
    { text: "• Coleta de dados multi-dimensional (Votação e Questionário).\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Dashboard administrativo para análise de tendências em tempo real.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Foco total em UX/UI de alta performance (Elite standard).", options: { fontSize: 16, color: THEME.muted } }
  ], { x: 0.5, y: 1.5, w: 9, h: 3.5 });

  // 3. TECNOLOGIAS UTILIZADAS
  const s3 = pptx.addSlide();
  applyDarkTheme(s3);
  s3.addText("STACK TECNOLÓGICA", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  const techs = ["React 18", "Supabase", "Railway", "Framer Motion", "Chart.js", "PptxGenJS"];
  techs.forEach((t, i) => {
    s3.addText(t, {
      x: 0.5 + (i % 2) * 4.5,
      y: 1.5 + Math.floor(i / 2) * 1,
      w: 4, h: 0.8,
      fontSize: 24, align: "center", bold: true,
      fill: { color: "111118" },
      color: THEME.grad2,
      line: { color: THEME.border, width: 1 }
    });
  });

  // 4. FUNCIONAMENTO
  const s4 = pptx.addSlide();
  applyDarkTheme(s4);
  s4.addText("FLUXO DE OPERAÇÃO", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  const flows = [
    { n: "01", t: "Votação", d: "Escolha rápida das top IAs." },
    { n: "02", t: "Questionário", d: "Coleta de contexto profissional." },
    { n: "03", t: "Mural", d: "Filtro de identidade profissional." },
    { n: "04", t: "Dashboard", d: "Visão analítica consolidada." }
  ];
  flows.forEach((f, i) => {
    s4.addText(`${f.n} - ${f.t}`, { x: 0.5, y: 1.5 + i * 1, fontSize: 20, bold: true, color: THEME.text });
    s4.addText(f.d, { x: 1, y: 1.9 + i * 1, fontSize: 14, color: THEME.muted });
  });

  // 5. MÉTRICAS PRINCIPAIS
  const s5 = pptx.addSlide();
  applyDarkTheme(s5);
  s5.addText("MÉTRICAS DE PERFORMANCE", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  const metrics = [
    { l: "TOTAL DE VOTOS", v: data.totalVotes || 0 },
    { l: "CONEXÕES ÚNICAS", v: data.totalUniqueVoters || 0 },
    { l: "QUESTIONÁRIOS", v: data.totalResponses || 0 },
    { l: "USO ACADÊMICO", v: `${data.useForStudy || 0} pts` }
  ];
  metrics.forEach((m, i) => {
    s5.addText(m.l, { x: 0.5 + (i % 2) * 4.5, y: 1.5 + Math.floor(i / 2) * 2, fontSize: 14, color: THEME.muted });
    s5.addText(m.v.toString(), { x: 0.5 + (i % 2) * 4.5, y: 1.9 + Math.floor(i / 2) * 2, fontSize: 48, bold: true, color: THEME.accent });
  });

  // 6. RANKING DAS IAs (CHART)
  const s6 = pptx.addSlide();
  applyDarkTheme(s6);
  s6.addText("TOP 5 - RANKING DE PREFERÊNCIA", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: THEME.accent });
  if (charts.ranking) {
    s6.addImage({ data: charts.ranking, x: 1, y: 1.2, w: 8, h: 4 });
  } else {
    s6.addText("Gráfico de Ranking não disponível", { x: 1, y: 3, w: 8, fontSize: 18, color: THEME.muted, align: "center" });
  }

  // 7. ONDE USAM IA (CHART)
  const s7 = pptx.addSlide();
  applyDarkTheme(s7);
  s7.addText("CONTEXTO DE UTILIZAÇÃO", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: THEME.accent });
  if (charts.where) {
    s7.addImage({ data: charts.where, x: 2, y: 1.2, w: 6, h: 4 });
  } else {
    s7.addText("Gráfico de Contexto não disponível", { x: 1, y: 3, w: 8, fontSize: 18, color: THEME.muted, align: "center" });
  }

  // 8. ÁREA DE ATUAÇÃO (CHART)
  const s8 = pptx.addSlide();
  applyDarkTheme(s8);
  s8.addText("CAMPOS DE ATUAÇÃO PRINCIPAIS", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: THEME.accent });
  if (charts.workArea) {
    s8.addImage({ data: charts.workArea, x: 1, y: 1.2, w: 8, h: 4 });
  } else {
    s8.addText("Gráfico de Atuação não disponível", { x: 1, y: 3, w: 8, fontSize: 18, color: THEME.muted, align: "center" });
  }

  // 9. PAINEL ADMINISTRATIVO
  const s9 = pptx.addSlide();
  applyDarkTheme(s9);
  s9.addText("GESTÃO ADMINISTRATIVA", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  s9.addText([
    { text: "Controle total sobre o ecossistema:\n\n", options: { fontSize: 18, color: THEME.text } },
    { text: "• Sincronização em tempo real com Supabase.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Exportação de backups e relatórios automatizados.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Gestão de permissões e segurança de dados.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Proteção contra spam e nomes inapropriados via filtros IA.", options: { fontSize: 16, color: THEME.muted } }
  ], { x: 0.5, y: 1.5, w: 9, h: 3.5 });

  // 10. IA COMO PAIR PROGRAMMING
  const s10 = pptx.addSlide();
  applyDarkTheme(s10);
  s10.addText("INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO", { x: 0.5, y: 0.5, fontSize: 26, bold: true, color: THEME.accent });
  s10.addText([
    { text: "O desenvolvimento deste sistema foi acelerado por IA:\n\n", options: { fontSize: 18, color: THEME.text } },
    { text: "• Apoio Técnico: Refatoração de código complexo em segundos.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Correção Proativa: Identificação de bugs de lógica antes do deploy.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Design Sistêmico: UX baseada em padrões de elite SaaS.\n", options: { fontSize: 16, color: THEME.muted } },
    { text: "• Eficiência: Redução de 70% no tempo de implementação.", options: { fontSize: 16, color: THEME.muted } }
  ], { x: 0.5, y: 1.5, w: 9, h: 3.5 });

  // 11. CONCLUSÃO
  const s11 = pptx.addSlide();
  applyDarkTheme(s11);
  s11.addText("CONCLUSÃO E FUTURO", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.accent });
  s11.addText("O AI Vote 2026 demonstra o poder da união entre dados reais e visualizações modernas. O ecossistema está preparado para escala global e integração com novos módulos de inteligência preditiva.\n\nPróximo Passo: Deploy Continental Railway.", {
    x: 0.5, y: 1.8, w: 9, h: 3,
    fontSize: 20, color: THEME.text, italic: true
  });
  s11.addText("💎 AI VOTE 2026 - FINAL REPORT", {
    x: 1, y: 5, w: 8, h: 0.5,
    fontSize: 16, bold: true, color: THEME.grad1, align: "center"
  });

  // Salvar o arquivo
  return pptx.writeFile({ fileName: `APRESENTACAO_AIVOTE_2026_${new Date().toISOString().split('T')[0]}.pptx` });
};

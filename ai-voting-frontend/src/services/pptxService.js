import pptxgen from "pptxgenjs";

/**
 * Serviço de Geração de Apresentação de Elite v2.0 - AI VOTE 2026 🚀
 * Agora com 14 slides e conteúdo acadêmico integrado.
 */
export const generateAIVotePresentation = async (data, charts, academicContent) => {
  const pptx = new pptxgen();

  // Configurações Globais de Design
  const THEME = {
    bg: "030305",
    accent: "6366F1",
    text: "FFFFFF",
    muted: "D0D0F0",
    grad1: "6366F1",
    grad2: "8B5CF6",
    border: "222233"
  };

  pptx.layout = "LAYOUT_16x9";
  pptx.title = "AI Vote 2026 - Apresentação Acadêmica";

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
    x: 1, y: 1, w: 8, h: 1,
    fontSize: 48, bold: true, color: THEME.grad1, fontFace: "Arial Black",
    align: "center"
  });
  s1.addText("Ecossistema Analítico de Elite", {
    x: 1, y: 1.8, w: 8, h: 0.5,
    fontSize: 20, italic: true, color: THEME.text, fontFace: "Arial",
    align: "center"
  });
  
  // Autores no Slide de Capa
  const authors = [
    "Victor Fonseca da Silva - 20242143006",
    "Erick Fernando de Jesus Silva - 20242143005",
    "Gabriel Calixto Rosa - 20242143018",
    "João Lucas Santos Mendonça - 20211193013",
    "Luiz Henrique Rocha dos Santos - 20241173010",
    "Mikael Marques de Carvalho Dias - 20242203009",
    "Pablo Henrique Rodrigues Gomes - 20242143004"
  ];
  s1.addText(authors.join("\n"), {
    x: 1, y: 2.5, w: 8, h: 2,
    fontSize: 10, color: THEME.muted, align: "center", bold: true
  });

  s1.addText("Apresentação Acadêmica de Resultados - UNIALFA", {
    x: 1, y: 5.2, w: 8, h: 0.3,
    fontSize: 12, color: THEME.muted, align: "center"
  });

  // 2. RESUMO
  const s2 = pptx.addSlide();
  applyDarkTheme(s2);
  s2.addText("RESUMO DO TRABALHO", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: THEME.accent });
  s2.addText(academicContent.resumo, {
    x: 0.5, y: 1.2, w: 9, h: 3.5,
    fontSize: 14, color: THEME.text, align: "justify"
  });

  // 3. CONTEXTUALIZAÇÃO E PROBLEMA
  const s3 = pptx.addSlide();
  applyDarkTheme(s3);
  s3.addText("CONTEXTUALIZAÇÃO E PROBLEMA", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  const introClean = academicContent.introducao.replace(/^1 INTRODUÇÃO: /, "");
  s3.addText(introClean, { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 12, color: THEME.text, align: "justify" });
  
  // 4. OBJETIVOS DA PESQUISA
  const s4 = pptx.addSlide();
  applyDarkTheme(s4);
  s4.addText("OBJETIVOS DA PESQUISA", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  const objClean = academicContent.objetivos.replace(/^2 OBJETIVOS: /, "");
  s4.addText(objClean, { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 13, color: THEME.text, align: "justify" });

  // 5. TECNOLOGIAS UTILIZADAS
  const s5 = pptx.addSlide();
  applyDarkTheme(s5);
  s5.addText("STACK TECNOLÓGICA", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: THEME.accent });
  const techs = ["React 18", "Supabase", "Railway", "Framer Motion", "Chart.js", "PptxGenJS", "jsPDF"];
  techs.forEach((t, i) => {
    s5.addText(t, {
      x: 0.5 + (i % 4) * 2.3,
      y: 1.2 + Math.floor(i / 4) * 1.2,
      w: 2.1, h: 0.8,
      fontSize: 14, align: "center", bold: true,
      fill: { color: "111118" },
      color: THEME.grad2,
      line: { color: THEME.border, width: 1 }
    });
  });

  // 6. ARQUITETURA DO SISTEMA
  const s6 = pptx.addSlide();
  applyDarkTheme(s6);
  s6.addText("ARQUITETURA DO SISTEMA", { x: 0.5, y: 0.4, fontSize: 22, bold: true, color: THEME.accent });
  s6.addText("Modelo SPA + BaaS", { x: 0.5, y: 1.1, fontSize: 16, color: THEME.text, bold: true });
  s6.addText([
    { text: "• Frontend: React 18 com hooks customizados.\n", options: { fontSize: 14, color: THEME.muted } },
    { text: "• Persistência: PostgreSQL com realtime sync via Supabase.\n", options: { fontSize: 14, color: THEME.muted } },
    { text: "• Infraestrutura: Deploy atômico via Railway (CI/CD).\n", options: { fontSize: 14, color: THEME.muted } },
    { text: "• Segurança: Row Level Security e tokens JWT.", options: { fontSize: 14, color: THEME.muted } }
  ], { x: 0.5, y: 1.8, w: 9, h: 2.5 });

  // 7. BANCO DE DADOS
  const s7 = pptx.addSlide();
  applyDarkTheme(s7);
  s7.addText("BANCO DE DADOS", { x: 0.5, y: 0.4, fontSize: 22, bold: true, color: THEME.accent });
  s7.addText("Estrutura Relacional (PostgreSQL)", { x: 0.5, y: 1, fontSize: 14, color: THEME.muted });
  const tables = [
    { t: "users", d: "Perfil demográfico e credenciais." },
    { t: "votes", d: "Registros de preferências de IA." },
    { t: "question_responses", d: "Respostas detalhadas do questionário." },
    { t: "audit_logs", d: "Logs de segurança e ações críticas." }
  ];
  tables.forEach((tab, i) => {
    s7.addText(tab.t, { x: 0.5, y: 1.8 + i * 0.7, w: 2, h: 0.4, fontSize: 14, bold: true, color: THEME.accent, fill: { color: "111118" } });
    s7.addText(tab.d, { x: 2.7, y: 1.8 + i * 0.7, w: 6, h: 0.4, fontSize: 12, color: THEME.text });
  });

  // 8. FUNCIONALIDADES PRINCIPAIS
  const s8 = pptx.addSlide();
  applyDarkTheme(s8);
  s8.addText("FUNCIONALIDADES PRINCIPAIS", { x: 0.5, y: 0.4, fontSize: 22, bold: true, color: THEME.accent });
  const funcs = [
    "🗳️ Votação Dinâmica com Icons de IA",
    "📝 Questionário Socioeconômico Completo",
    "📈 Dashboard com Filtros em Tempo Real",
    "🔐 Painel Admin para Gestão de Dados",
    "📊 Gerador de Apresentação Acadêmica"
  ];
  funcs.forEach((f, i) => {
    s8.addText(f, { x: 1, y: 1.2 + i * 0.6, fontSize: 16, color: THEME.text });
  });

  // 9. DASHBOARD E ANALYTICS
  const s9 = pptx.addSlide();
  applyDarkTheme(s9);
  s9.addText("DASHBOARD E ANALYTICS", { x: 0.5, y: 0.4, fontSize: 22, bold: true, color: THEME.accent });
  s9.addText("Visualização analítica baseada em Chart.js", { x: 0.5, y: 1.3, fontSize: 16, color: THEME.muted });
  if (charts.workArea) {
    s9.addImage({ data: charts.workArea, x: 0.5, y: 2, w: 4.5, h: 3 });
  }
  if (charts.where) {
    s9.addImage({ data: charts.where, x: 5.2, y: 2, w: 4.3, h: 3 });
  }

  // 10. MÉTRICAS E RESULTADOS
  const s10 = pptx.addSlide();
  applyDarkTheme(s10);
  s10.addText("MÉTRICAS E RESULTADOS", { x: 0.5, y: 0.4, fontSize: 22, bold: true, color: THEME.accent });
  const metrics = [
    { l: "TOTAL DE VOTOS", v: data.totalVotes || 0 },
    { l: "QUESTIONÁRIOS", v: data.totalResponses || 0 },
    { l: "USO ACADÊMICO", v: `${data.useForStudy || 0} pts` },
    { l: "USO PROFISSIONAL", v: `${data.useForWork || 0} pts` }
  ];
  metrics.forEach((m, i) => {
    s10.addText(m.l, { x: 0.5 + (i % 2) * 4.5, y: 1.5 + Math.floor(i / 2) * 1.8, fontSize: 14, color: THEME.muted });
    s10.addText(m.v.toString(), { x: 0.5 + (i % 2) * 4.5, y: 1.9 + Math.floor(i / 2) * 1.8, fontSize: 40, bold: true, color: THEME.accent });
  });

  // 11. METODOLOGIA
  const s11 = pptx.addSlide();
  applyDarkTheme(s11);
  s11.addText("METODOLOGIA APLICADA", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  const metClean = academicContent.metodologia.replace(/^3 METODOLOGIA: /, "");
  s11.addText(metClean, { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 13, color: THEME.text, align: "justify" });

  // 12. DESAFIOS ENFRENTADOS
  const s12 = pptx.addSlide();
  applyDarkTheme(s12);
  s12.addText("DESAFIOS ENFRENTADOS", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  const challenges = [
    "• Sincronização em tempo real sem sobrecarga de rede.",
    "• Captura de gráficos do canvas para exportação de documentos.",
    "• Implementação de segurança RLS robusta no Supabase.",
    "• UX responsiva para dashboards complexos em mobile."
  ];
  challenges.forEach((c, i) => {
    s12.addText(c, { x: 0.5, y: 1.5 + i * 0.8, fontSize: 16, color: THEME.text });
  });

  // 13. CONCLUSÃO
  const s13 = pptx.addSlide();
  applyDarkTheme(s13);
  s13.addText("CONSIDERAÇÕES FINAIS", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  const concClean = academicContent.conclusao.replace(/^6 CONCLUSÃO: /, "");
  s13.addText(concClean, { x: 0.5, y: 1.8, w: 9, h: 3, fontSize: 14, color: THEME.text, italic: true, align: "justify" });

  // 14. REFERÊNCIAS
  const s14 = pptx.addSlide();
  applyDarkTheme(s14);
  s14.addText("REFERÊNCIAS", { x: 0.5, y: 0.3, fontSize: 22, bold: true, color: THEME.accent });
  s14.addText(academicContent.referencias, { x: 0.5, y: 1.5, w: 9, fontSize: 14, color: THEME.muted });

  // 15. AGRADECIMENTO
  const s15 = pptx.addSlide();
  s15.background = { fill: THEME.bg };
  s15.addText("OBRIGADO!", {
    x: 1, y: 2.5, w: 8, h: 1,
    fontSize: 70, bold: true, color: THEME.grad1, fontFace: "Arial Black",
    align: "center"
  });
  s15.addText("Dúvidas ou Feedback?", {
    x: 1, y: 3.8, w: 8, h: 0.5,
    fontSize: 24, color: THEME.text, align: "center"
  });

  // Salvar o arquivo
  return pptx.writeFile({ fileName: `APRESENTACAO_AIVOTE_2026_${new Date().toISOString().split('T')[0]}.pptx` });
};

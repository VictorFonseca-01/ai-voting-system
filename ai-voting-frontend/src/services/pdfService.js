import { jsPDF } from "jspdf";

/**
 * Serviço de Geração de Relatório Acadêmico de ELITE 🎓
 * Totalmente alinhado com as normas ABNT e diretrizes da UNIALFA.
 */
export const generateAcademicPDF = async (content, data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25; // Margem ABNT padrão
  const contentWidth = pageWidth - (2 * margin);

  // --- Helpers de Estilo ---
  const setBold = (size = 12) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
  };
  const setNormal = (size = 12) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
  };
  const centerText = (text, y, size = 12, bold = false) => {
    bold ? setBold(size) : setNormal(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addPageNumber = () => {
    const pageCount = doc.internal.getNumberOfPages();
    setNormal(10);
    doc.text(`${pageCount}`, pageWidth - margin, 15);
  };

  // --- 1. CAPA (NORMAS ABNT) ---
  centerText("CENTRO UNIVERSITÁRIO ALVES FARIA – UNIALFA", 30, 14, true);
  centerText("DEPARTAMENTO DE ENGENHARIAS", 38, 12, true);
  centerText("CURSO DE ENGENHARIA DE SOFTWARE", 46, 12, true);

  const authors = [
    "Victor Fonseca da Silva - 20242143006",
    "Erick Fernando de Jesus Silva - 20242143005",
    "Gabriel Calixto Rosa - 20242143018",
    "João Lucas Santos Mendonça - 20211193013",
    "Luiz Henrique Rocha dos Santos - 20241173010",
    "Mikael Marques de Carvalho Dias - 20242203009",
    "Pablo Henrique Rodrigues Gomes - 20242143004"
  ];
  
  let authorY = 90;
  authors.forEach((author) => {
    centerText(author, authorY, 11);
    authorY += 7;
  });

  centerText(data.name.toUpperCase(), 160, 18, true);
  centerText("RELATÓRIO TÉCNICO DE PESQUISA ESTATÍSTICA APLICADA", 170, 13, false);

  centerText("GOIÂNIA - GO", 260, 12);
  centerText("2026", 268, 12);

  // --- 2. FOLHA DE ROSTO ---
  doc.addPage();
  authorY = 40;
  authors.forEach((author) => {
    centerText(author, authorY, 11);
    authorY += 7;
  });

  centerText(data.name.toUpperCase(), 120, 16, true);

  // Texto de natureza do trabalho
  setNormal(10);
  const natureText = "Relatório técnico apresentado ao Centro Universitário Alves Faria (UNIALFA), como requisito parcial para obtenção de nota na disciplina de Probabilidade e Estatística sob orientação do Professor Esp. Eduardo Ungarelli.";
  const natureLines = doc.splitTextToSize(natureText, 90);
  doc.text(natureLines, 100, 150, { align: "justify" });

  centerText("GOIÂNIA - GO", 260, 12);
  centerText("2026", 268, 12);

  // --- 3. RESUMO ---
  doc.addPage();
  addPageNumber();
  centerText("RESUMO", 40, 14, true);
  
  setNormal(11);
  const cleanResumo = content.resumo.replace("RESUMO: ", "").trim();
  const resumoLines = doc.splitTextToSize(cleanResumo, contentWidth);
  doc.text(resumoLines, margin, 60, { align: "justify", maxWidth: contentWidth, lineHeightFactor: 1.5 });

  // --- 4. SUMÁRIO (DINÂMICO) ---
  doc.addPage();
  addPageNumber();
  centerText("SUMÁRIO", 40, 14, true);
  
  const sections = [
    { title: "1 INTRODUÇÃO", page: 5 },
    { title: "2 OBJETIVOS", page: 5 },
    { title: "3 METODOLOGIA", page: 5 },
    { title: "4 DESENVOLVIMENTO", page: 6 },
    { title: "5 RESULTADOS E DISCUSSÃO", page: 6 },
    { title: "6 CONCLUSÃO", page: 7 },
    { title: "REFERÊNCIAS", page: 8 }
  ];

  let sumY = 60;
  sections.forEach(s => {
    setBold(12);
    doc.text(s.title, margin, sumY);
    // Linha pontilhada
    setNormal(10);
    const dotWidth = doc.getTextWidth(".");
    let dots = "";
    const startX = margin + doc.getTextWidth(s.title) + 5;
    const endX = pageWidth - margin - 10;
    for (let x = startX; x < endX; x += dotWidth + 1) {
      dots += ".";
    }
    doc.text(dots, startX, sumY);
    doc.text(s.page.toString(), pageWidth - margin, sumY);
    sumY += 10;
  });

  // --- 5. CORPO DO TEXTO ---
  doc.addPage();
  addPageNumber();
  let yPos = 30;

  const addAcademicSection = (title, text) => {
    const cleanText = text.includes(": ") ? text.split(": ").slice(1).join(": ").trim() : text.trim();
    const lines = doc.splitTextToSize(cleanText, contentWidth);
    const sectionHeight = (lines.length * 7) + 25;

    if (yPos + sectionHeight > pageHeight - margin) {
      doc.addPage();
      addPageNumber();
      yPos = 30;
    }

    setBold(13);
    doc.text(title, margin, yPos);
    yPos += 10;
    
    setNormal(12);
    // Recuo de parágrafo ABNT
    doc.text(lines, margin + 15, yPos, { align: "justify", maxWidth: contentWidth - 15, lineHeightFactor: 1.5 });
    yPos += (lines.length * 7) + 15;
  };

  addAcademicSection("1 INTRODUÇÃO", content.introducao);
  addAcademicSection("2 OBJETIVOS", content.objetivos);
  addAcademicSection("3 METODOLOGIA", content.metodologia);
  addAcademicSection("4 DESENVOLVIMENTO", content.desenvolvimento);
  addAcademicSection("5 RESULTADOS E DISCUSSÃO", content.resultados);
  addAcademicSection("6 CONCLUSÃO", content.conclusao);

  // --- 6. REFERÊNCIAS ---
  doc.addPage();
  addPageNumber();
  centerText("REFERÊNCIAS", 30, 14, true);
  
  const cleanRef = content.referencias.replace("REFERÊNCIAS: ", "").replace("REFERÊNCIAS:\n", "").trim();
  const refLines = doc.splitTextToSize(cleanRef, contentWidth);
  setNormal(11);
  doc.text(refLines, margin, 50, { lineHeightFactor: 1.2 });

  // Finalizar e Salvar
  doc.save(`PROJETO_ESTATISTICO_AIVOTE_UNIALFA_2026.pdf`);
};

import { jsPDF } from "jspdf";

/**
 * Serviço de Geração de Relatório Acadêmico de ELITE 🎓
 * Versão ULTRA-ESTÁVEL: Resolve definitivamente sobreposição e quebras de página.
 */
export const generateAcademicPDF = async (content, data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30; // Margem Esquerda/Superior 30mm
  const rightMargin = 20; // Margem Direita 20mm
  const bottomMargin = 20; // Margem Inferior 20mm
  const contentWidth = pageWidth - margin - rightMargin;
  const FONT_SIZE_TEXT = 12;
  const LINE_HEIGHT = 7; // Aprox 1.5 de espaçamento

  let yPos = 30;

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

  const checkNewPage = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      const pageCount = doc.internal.getNumberOfPages();
      setNormal(10);
      doc.text(`${pageCount}`, pageWidth - 20, 15);
      yPos = 30;
      return true;
    }
    return false;
  };

  // --- 1. CAPA ---
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
  
  let authY = 90;
  authors.forEach(a => { centerText(a, authY, 11); authY += 7; });

  centerText(data.name.toUpperCase(), 170, 18, true);
  centerText("RELATÓRIO TÉCNICO DE PESQUISA ESTATÍSTICA APLICADA", 180, 12);
  centerText("GOIÂNIA - GO", 260, 12);
  centerText("2026", 268, 12);

  // --- 2. FOLHA DE ROSTO ---
  doc.addPage();
  authY = 30;
  authors.forEach(a => { centerText(a, authY, 11); authY += 7; });
  centerText(data.name.toUpperCase(), 120, 16, true);
  
  setNormal(10);
  const natureText = "Relatório técnico apresentado ao Centro Universitário Alves Faria (UNIALFA), como requisito parcial para obtenção de nota na disciplina de Probabilidade e Estatística sob orientação do Professor Esp. Eduardo Ungarelli.";
  const natureLines = doc.splitTextToSize(natureText, 100);
  doc.text(natureLines, 85, 150, { align: "justify" });
  
  centerText("GOIÂNIA - GO", 260, 12);
  centerText("2026", 268, 12);

  // --- 3. CONTEÚDO DINÂMICO ---
  const addBlock = (title, text, isMainTitle = false) => {
    if (isMainTitle) {
      doc.addPage();
      const pageCount = doc.internal.getNumberOfPages();
      setNormal(10);
      doc.text(`${pageCount}`, pageWidth - 20, 15);
      yPos = 30;
    }

    checkNewPage(15);
    setBold(isMainTitle ? 14 : 12);
    doc.text(title, margin, yPos);
    yPos += 10;

    setNormal(FONT_SIZE_TEXT);
    const cleanText = text.includes(": ") ? text.split(": ").slice(1).join(": ").trim() : text.trim();
    const lines = doc.splitTextToSize(cleanText, contentWidth - 15);

    lines.forEach(line => {
      if (checkNewPage(LINE_HEIGHT)) {
        // Se mudou de página, repete um pequeno recuo ou título se necessário (não aqui para texto corrido)
      }
      doc.text(line, margin + 15, yPos);
      yPos += LINE_HEIGHT;
    });
    yPos += 8; // Espaço entre seções
  };

  yPos = 30;
  addBlock("RESUMO", content.resumo, true);
  
  addBlock("1 INTRODUÇÃO", content.introducao, true);
  addBlock("2 OBJETIVOS", content.objetivos);
  addBlock("3 METODOLOGIA", content.metodologia);
  addBlock("4 DESENVOLVIMENTO", content.desenvolvimento, true);
  addBlock("5 RESULTADOS E DISCUSSÃO", content.resultados);
  addBlock("6 CONCLUSÃO", content.conclusao);

  addBlock("REFERÊNCIAS", content.referencias, true);

  doc.save(`PROJETO_ESTATISTICO_AIVOTE_2026.pdf`);
};

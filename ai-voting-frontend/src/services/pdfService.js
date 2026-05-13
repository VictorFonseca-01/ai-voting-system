import { jsPDF } from "jspdf";

/**
 * Serviço de Geração de Relatório Acadêmico em PDF 📄
 * Baseado nas normas ABNT e Diretrizes UNIALFA
 */
export const generateAcademicPDF = async (content, data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // --- Função Auxiliar: Texto Centralizado ---
  const centerText = (text, y, size = 12, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // --- 1. CAPA ---
  centerText("CENTRO UNIVERSITÁRIO ALVES FARIA – UNIALFA", 20, 14, true);
  centerText("DEPARTAMENTO DE ENGENHARIAS", 28, 12, true);
  centerText("DISCIPLINA: PROBABILIDADE E ESTATÍSTICA", 36, 11);
  centerText("PROFESSOR: ESP. EDUARDO UNGARELLI", 44, 11);
  
  // Lista de Autores Centralizada
  let authorY = 65;
  centerText("AUTORES:", authorY, 12, true);
  const authors = [
    "Victor Fonseca da Silva - 20242143006",
    "Erick Fernando de Jesus Silva - 20242143005",
    "Gabriel Calixto Rosa - 20242143018",
    "João Lucas Santos Mendonça - 20211193013",
    "Luiz Henrique Rocha dos Santos - 20241173010",
    "Mikael Marques de Carvalho Dias - 20242203009",
    "Pablo Henrique Rodrigues Gomes - 20242143004"
  ];
  authors.forEach((author, i) => {
    centerText(author, authorY + 8 + (i * 6), 10);
  });
  
  centerText("PROJETO: " + data.name.toUpperCase(), 160, 20, true);
  centerText("RELATÓRIO TÉCNICO DE PESQUISA ESTATÍSTICA", 170, 13);
  
  centerText("GOIÂNIA - GO", 275, 12);
  centerText("2026", 282, 12);

  // --- 2. RESUMO ---
  doc.addPage();
  centerText("RESUMO", 30, 14, true);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const resumoLines = doc.splitTextToSize(content.resumo.replace("RESUMO: ", ""), contentWidth - 5);
  doc.text(resumoLines, margin, 50, { align: "justify", maxWidth: contentWidth - 5 });

  // --- 3. CONTEÚDO PRINCIPAL ---
  doc.addPage();
  let yPos = 30;

  const addSection = (title, text) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, margin, yPos);
    yPos += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const bodyText = text.includes(": ") ? text.split(": ").slice(1).join(": ") : text;
    const lines = doc.splitTextToSize(bodyText, contentWidth - 5);
    doc.text(lines, margin, yPos, { align: "justify", maxWidth: contentWidth - 5 });
    yPos += (lines.length * 6) + 12;
  };

  addSection("1 INTRODUÇÃO", content.introducao);
  addSection("2 OBJETIVOS", content.objetivos);
  addSection("3 METODOLOGIA", content.metodologia);
  addSection("4 DESENVOLVIMENTO", content.desenvolvimento);
  addSection("5 RESULTADOS E DISCUSSÃO", content.resultados);
  addSection("6 CONCLUSÃO", content.conclusao);

  // --- 4. REFERÊNCIAS ---
  doc.addPage();
  centerText("REFERÊNCIAS", 30, 14, true);
  const refLines = doc.splitTextToSize(content.referencias.replace("REFERÊNCIAS: ", "").replace("REFERÊNCIAS:\n", ""), contentWidth);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(refLines, margin, 50);

  // Salvar
  doc.save(`RELATORIO_ESTATISTICO_AIVOTE_2026.pdf`);
};

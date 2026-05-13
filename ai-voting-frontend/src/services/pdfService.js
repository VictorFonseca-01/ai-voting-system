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
  let authorY = 80;
  centerText("AUTORES:", authorY, 12, true);
  const authors = [
    "Victor Fonseca",
    "Erick Fernando",
    "Gabriel Calixto",
    "João Lucas",
    "Luizinho",
    "Mikael",
    "Pablo"
  ];
  authors.forEach((author, i) => {
    centerText(author, authorY + 10 + (i * 7), 12);
  });
  
  centerText("PROJETO: " + data.name.toUpperCase(), 160, 24, true);
  centerText("RELATÓRIO TÉCNICO DE PESQUISA ESTATÍSTICA", 172, 14);
  
  centerText("GOIÂNIA - GO", 270, 12);
  centerText("2026", 280, 12);

  // --- 2. RESUMO ---
  doc.addPage();
  centerText("RESUMO", 30, 14, true);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const resumoLines = doc.splitTextToSize(content.resumo.replace("RESUMO: ", ""), contentWidth);
  doc.text(resumoLines, margin, 50, { align: "justify" });

  // --- 3. CONTEÚDO PRINCIPAL ---
  doc.addPage();
  let yPos = 30;

  const addSection = (title, text) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const bodyText = text.includes(": ") ? text.split(": ").slice(1).join(": ") : text;
    const lines = doc.splitTextToSize(bodyText, contentWidth);
    doc.text(lines, margin, yPos, { align: "justify" });
    yPos += (lines.length * 7) + 15;
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

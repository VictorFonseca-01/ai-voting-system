import { jsPDF } from "jspdf";

/**
 * Serviço de Geração de Relatório Acadêmico em PDF 📄
 * Baseado nas normas ABNT (Simplificado)
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
  centerText("INSTITUIÇÃO DE ENSINO SUPERIOR", 30, 14, true);
  centerText("CURSO DE TECNOLOGIA DA INFORMAÇÃO", 40, 12, true);
  
  centerText("VICTOR FONSECA & EQUIPE", 100, 14, true);
  
  centerText(data.name.toUpperCase(), 140, 22, true);
  centerText("RELATÓRIO TÉCNICO-ACADÊMICO", 150, 14);
  
  centerText("CIDADE - UF", 260, 12);
  centerText("2026", 270, 12);

  // --- 2. RESUMO ---
  doc.addPage();
  centerText("RESUMO", 30, 14, true);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const resumoLines = doc.splitTextToSize(content.resumo.replace("RESUMO: ", ""), contentWidth);
  doc.text(resumoLines, margin, 50);

  // --- 3. CONTEÚDO PRINCIPAL ---
  doc.addPage();
  let yPos = 30;

  const addSection = (title, text) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text.split(": ")[1] || text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 7) + 15;
  };

  addSection("1. INTRODUÇÃO", content.introducao);
  addSection("2. OBJETIVOS", content.objetivos);
  addSection("3. METODOLOGIA", content.metodologia);
  addSection("4. DESENVOLVIMENTO", content.desenvolvimento);
  addSection("5. RESULTADOS E DISCUSSÃO", content.resultados);
  addSection("6. CONCLUSÃO", content.conclusao);

  // --- 4. REFERÊNCIAS ---
  doc.addPage();
  centerText("REFERÊNCIAS", 30, 14, true);
  const refLines = doc.splitTextToSize(content.referencias.replace("REFERÊNCIAS: ", ""), contentWidth);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(refLines, margin, 50);

  // Salvar
  doc.save(`RELATORIO_ACADEMICO_AIVOTE_${new Date().toISOString().split('T')[0]}.pdf`);
};

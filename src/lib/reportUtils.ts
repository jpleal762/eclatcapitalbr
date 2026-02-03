import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardData } from "@/types/kpi";

// ============= DARK THEME COLORS =============
const COLORS = {
  background: [26, 26, 26] as [number, number, number],      // #1a1a1a
  cardBg: [38, 38, 38] as [number, number, number],          // #262626
  alternateBg: [51, 51, 51] as [number, number, number],     // #333333
  text: [245, 245, 245] as [number, number, number],         // #f5f5f5
  textMuted: [156, 163, 175] as [number, number, number],    // #9ca3af
  gold: [212, 160, 0] as [number, number, number],           // #D4A000
  goldDark: [26, 26, 26] as [number, number, number],        // text on gold
  red: [220, 38, 38] as [number, number, number],            // #DC2626
  green: [34, 197, 94] as [number, number, number],          // #22c55e
};

// Formatar valor monetário para exibição
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

// Formatar número com separador de milhar
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value);
};

// Formatar porcentagem
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Determinar status baseado em porcentagem e ritmo
const getStatus = (percentage: number, ritmoIdeal: number): string => {
  if (percentage >= 100) return "✓ Meta atingida";
  if (percentage >= ritmoIdeal) return "No ritmo";
  if (percentage >= ritmoIdeal * 0.8) return "Atenção";
  return "Abaixo do esperado";
};

// Draw dark background on page
const drawDarkBackground = (doc: jsPDF) => {
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, 210, 297, "F");
};

export const generateWeeklyReport = (
  dashboardData: DashboardData,
  selectedAssessor: string,
  selectedMonth: string
) => {
  const doc = new jsPDF();
  const ritmoIdeal = dashboardData.ritmoIdeal;
  const visao = selectedAssessor === "all" ? "Escritório Eclat" : selectedAssessor;
  const visaoFileName = selectedAssessor === "all" 
    ? "escritorio" 
    : selectedAssessor.toLowerCase().replace(/\s+/g, "_");

  // ===== PAGE 1 - DARK BACKGROUND =====
  drawDarkBackground(doc);

  // ===== CABEÇALHO =====
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO SEMANAL DE KPIs", 14, 20);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Visão: ${visao}`, 14, 30);
  doc.text(`Período: ${selectedMonth.toUpperCase()}`, 14, 37);
  doc.text(`Data de Geração: ${new Date().toLocaleString("pt-BR")}`, 14, 44);

  // ===== INDICADORES GERAIS =====
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES GERAIS", 14, 58);
  
  // ICM Geral - highlight in red if below ritmo
  const icmColor = dashboardData.icmGeral < ritmoIdeal ? COLORS.red : COLORS.text;
  doc.setTextColor(...icmColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`ICM Geral: ${formatPercentage(dashboardData.icmGeral)}`, 14, 66);
  
  doc.setTextColor(...COLORS.text);
  doc.text(`Ritmo Ideal: ${formatPercentage(ritmoIdeal)}`, 80, 66);
  doc.text(`Dias Úteis Restantes: ${dashboardData.diasUteisRestantes}`, 140, 66);
  doc.text(`Total Dias Úteis: ${dashboardData.totalDiasUteis}`, 14, 73);
  doc.text(`Dias Decorridos: ${dashboardData.diasUteisDecorridos}`, 80, 73);

  // ===== TABELA: PLANEJAMENTO SEMANAL =====
  const semanalRows = dashboardData.metaSemanal.map((kpi) => {
    const meta = typeof kpi.value === "number" ? kpi.value : parseFloat(String(kpi.value)) || 0;
    const realizado = kpi.realizedValue || 0;
    const percentage = meta > 0 ? (realizado / meta) * 100 : 0;
    const falta = Math.max(0, meta - realizado);

    return [
      kpi.label,
      kpi.isCurrency ? formatCurrency(meta) : formatNumber(meta),
      kpi.isCurrency ? formatCurrency(realizado) : formatNumber(realizado),
      formatPercentage(percentage),
      kpi.isCurrency ? formatCurrency(falta) : formatNumber(falta),
      percentage, // hidden column for conditional formatting
    ];
  });

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PLANEJAMENTO SEMANAL ACUMULADO", 14, 87);

  autoTable(doc, {
    startY: 92,
    head: [["KPI", "Meta Semanal", "Realizado", "% Atingido", "Falta"]],
    body: semanalRows.map(row => row.slice(0, 5)), // exclude hidden percentage column
    theme: "plain",
    headStyles: { 
      fillColor: COLORS.gold,
      textColor: COLORS.goldDark,
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      fillColor: COLORS.cardBg,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.alternateBg,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const percentage = semanalRows[rowIndex]?.[5] as number;
        if (percentage < ritmoIdeal) {
          data.cell.styles.textColor = COLORS.red;
        }
      }
    },
  });

  // ===== TABELA: METAS MENSAIS (KPIs) =====
  const mensalRows = dashboardData.gaugeKPIs.map((kpi) => {
    const status = getStatus(kpi.percentage, ritmoIdeal);

    return [
      kpi.label,
      kpi.isCurrency ? formatCurrency(kpi.target) : formatNumber(kpi.target),
      kpi.isCurrency ? formatCurrency(kpi.value) : formatNumber(kpi.value),
      formatPercentage(kpi.percentage),
      status,
      kpi.percentage, // hidden column for conditional formatting
    ];
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("METAS MENSAIS (KPIs)", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["KPI", "Meta Mensal", "Realizado", "% Atingido", "Status"]],
    body: mensalRows.map(row => row.slice(0, 5)), // exclude hidden percentage column
    theme: "plain",
    headStyles: { 
      fillColor: COLORS.gold,
      textColor: COLORS.goldDark,
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      fillColor: COLORS.cardBg,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.alternateBg,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const percentage = mensalRows[rowIndex]?.[5] as number;
        if (percentage < ritmoIdeal) {
          data.cell.styles.textColor = COLORS.red;
        }
      }
    },
  });

  // ===== TABELA: PERFORMANCE POR ASSESSOR (se visão escritório) =====
  if (selectedAssessor === "all" && dashboardData.assessorPerformance.length > 0) {
    const assessorRows = dashboardData.assessorPerformance.map((a) => [
      a.fullName || a.name,
      formatPercentage(a.geralPercentage),
      formatPercentage(a.semanaPercentage),
      a.geralPercentage, // hidden for conditional formatting
    ]);

    const finalY2 = (doc as any).lastAutoTable?.finalY || 200;

    // Check if we need a new page
    if (finalY2 + 50 > doc.internal.pageSize.height) {
      doc.addPage();
      drawDarkBackground(doc);
      
      doc.setTextColor(...COLORS.gold);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERFORMANCE POR ASSESSOR", 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [["Assessor", "ICM Geral %", "ICM Semanal %"]],
        body: assessorRows.map(row => row.slice(0, 3)),
        theme: "plain",
        headStyles: { 
          fillColor: COLORS.gold,
          textColor: COLORS.goldDark,
          fontStyle: "bold",
          fontSize: 9,
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
        },
        bodyStyles: {
          fillColor: COLORS.cardBg,
          textColor: COLORS.text,
        },
        alternateRowStyles: {
          fillColor: COLORS.alternateBg,
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const rowIndex = data.row.index;
            const percentage = assessorRows[rowIndex]?.[3] as number;
            if (percentage < ritmoIdeal) {
              data.cell.styles.textColor = COLORS.red;
            }
          }
        },
      });
    } else {
      doc.setTextColor(...COLORS.gold);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERFORMANCE POR ASSESSOR", 14, finalY2 + 15);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Assessor", "ICM Geral %", "ICM Semanal %"]],
        body: assessorRows.map(row => row.slice(0, 3)),
        theme: "plain",
        headStyles: { 
          fillColor: COLORS.gold,
          textColor: COLORS.goldDark,
          fontStyle: "bold",
          fontSize: 9,
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
        },
        bodyStyles: {
          fillColor: COLORS.cardBg,
          textColor: COLORS.text,
        },
        alternateRowStyles: {
          fillColor: COLORS.alternateBg,
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const rowIndex = data.row.index;
            const percentage = assessorRows[rowIndex]?.[3] as number;
            if (percentage < ritmoIdeal) {
              data.cell.styles.textColor = COLORS.red;
            }
          }
        },
      });
    }
  }

  // Gerar arquivo PDF
  const fileName = `relatorio_${visaoFileName}_${selectedMonth.replace("/", "-")}.pdf`;
  doc.save(fileName);

  return fileName;
};

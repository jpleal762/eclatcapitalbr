import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardData } from "@/types/kpi";
import eclatLogoDark from "@/assets/eclat-xp-logo-dark.png";

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

  // ===== LOGO =====
  doc.addImage(eclatLogoDark, "PNG", 14, 8, 40, 10);

  // ===== CABEÇALHO =====
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO SEMANAL DE KPIs", 60, 14);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Visão: ${visao}  |  Período: ${selectedMonth.toUpperCase()}  |  Gerado: ${new Date().toLocaleDateString("pt-BR")}`, 60, 20);

  // ===== INDICADORES GERAIS =====
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES GERAIS", 14, 32);
  
  // ICM Geral - highlight in red if below ritmo
  const icmColor = dashboardData.icmGeral < ritmoIdeal ? COLORS.red : COLORS.green;
  doc.setTextColor(...icmColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`ICM Geral: ${formatPercentage(dashboardData.icmGeral)}`, 14, 38);
  
  doc.setTextColor(...COLORS.text);
  doc.text(`Ritmo Ideal: ${formatPercentage(ritmoIdeal)}`, 60, 38);
  doc.text(`Dias Úteis: ${dashboardData.diasUteisDecorridos}/${dashboardData.totalDiasUteis} (${dashboardData.diasUteisRestantes} restantes)`, 110, 38);

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

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PLANEJAMENTO SEMANAL ACUMULADO", 14, 48);

  autoTable(doc, {
    startY: 51,
    head: [["KPI", "Meta Semanal", "Realizado", "% Atingido", "Falta"]],
    body: semanalRows.map(row => row.slice(0, 5)),
    theme: "plain",
    headStyles: { 
      fillColor: COLORS.gold,
      textColor: COLORS.goldDark,
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: { 
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      fillColor: COLORS.cardBg,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.alternateBg,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 32, halign: "right" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 32, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const percentage = semanalRows[rowIndex]?.[5] as number;
        if (percentage < ritmoIdeal) {
          data.cell.styles.textColor = COLORS.red;
        } else {
          data.cell.styles.textColor = COLORS.green;
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

  const finalY = (doc as any).lastAutoTable?.finalY || 90;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("METAS MENSAIS (KPIs)", 14, finalY + 8);

  autoTable(doc, {
    startY: finalY + 11,
    head: [["KPI", "Meta Mensal", "Realizado", "% Atingido", "Status"]],
    body: mensalRows.map(row => row.slice(0, 5)),
    theme: "plain",
    headStyles: { 
      fillColor: COLORS.gold,
      textColor: COLORS.goldDark,
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: { 
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      fillColor: COLORS.cardBg,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.alternateBg,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 32, halign: "right" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const percentage = mensalRows[rowIndex]?.[5] as number;
        if (percentage < ritmoIdeal) {
          data.cell.styles.textColor = COLORS.red;
        } else {
          data.cell.styles.textColor = COLORS.green;
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

    const finalY2 = (doc as any).lastAutoTable?.finalY || 180;

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE POR ASSESSOR", 14, finalY2 + 8);

    autoTable(doc, {
      startY: finalY2 + 11,
      head: [["Assessor", "ICM Geral %", "ICM Semanal %"]],
      body: assessorRows.map(row => row.slice(0, 3)),
      theme: "plain",
      headStyles: { 
        fillColor: COLORS.gold,
        textColor: COLORS.goldDark,
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
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
          } else {
            data.cell.styles.textColor = COLORS.green;
          }
        }
      },
    });
  }

  // Gerar arquivo PDF
  const fileName = `relatorio_${visaoFileName}_${selectedMonth.replace("/", "-")}.pdf`;
  doc.save(fileName);

  return fileName;
};

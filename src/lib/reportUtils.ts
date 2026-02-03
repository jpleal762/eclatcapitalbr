import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardData } from "@/types/kpi";

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

export const generateWeeklyReport = (
  dashboardData: DashboardData,
  selectedAssessor: string,
  selectedMonth: string
) => {
  const doc = new jsPDF();
  const visao = selectedAssessor === "all" ? "Escritório Eclat" : selectedAssessor;
  const visaoFileName = selectedAssessor === "all" 
    ? "escritorio" 
    : selectedAssessor.toLowerCase().replace(/\s+/g, "_");

  // ===== CABEÇALHO =====
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO SEMANAL DE KPIs", 14, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Visão: ${visao}`, 14, 30);
  doc.text(`Período: ${selectedMonth.toUpperCase()}`, 14, 37);
  doc.text(`Data de Geração: ${new Date().toLocaleString("pt-BR")}`, 14, 44);

  // ===== INDICADORES GERAIS =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES GERAIS", 14, 58);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`ICM Geral: ${formatPercentage(dashboardData.icmGeral)}`, 14, 66);
  doc.text(`Ritmo Ideal: ${formatPercentage(dashboardData.ritmoIdeal)}`, 80, 66);
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
    ];
  });

  autoTable(doc, {
    startY: 82,
    head: [["KPI", "Meta Semanal", "Realizado", "% Atingido", "Falta"]],
    body: semanalRows,
    theme: "striped",
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35, halign: "right" },
    },
    didDrawPage: (data) => {
      // Add section title before table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PLANEJAMENTO SEMANAL ACUMULADO", 14, (data.settings.startY || 82) - 5);
    }
  });

  // ===== TABELA: METAS MENSAIS (KPIs) =====
  const mensalRows = dashboardData.gaugeKPIs.map((kpi) => {
    const status = getStatus(kpi.percentage, dashboardData.ritmoIdeal);

    return [
      kpi.label,
      kpi.isCurrency ? formatCurrency(kpi.target) : formatNumber(kpi.target),
      kpi.isCurrency ? formatCurrency(kpi.value) : formatNumber(kpi.value),
      formatPercentage(kpi.percentage),
      status,
    ];
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("METAS MENSAIS (KPIs)", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["KPI", "Meta Mensal", "Realizado", "% Atingido", "Status"]],
    body: mensalRows,
    theme: "striped",
    headStyles: { 
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35 },
    },
  });

  // ===== TABELA: PERFORMANCE POR ASSESSOR (se visão escritório) =====
  if (selectedAssessor === "all" && dashboardData.assessorPerformance.length > 0) {
    const assessorRows = dashboardData.assessorPerformance.map((a) => [
      a.fullName || a.name,
      formatPercentage(a.geralPercentage),
      formatPercentage(a.semanaPercentage),
    ]);

    const finalY2 = (doc as any).lastAutoTable?.finalY || 200;

    // Check if we need a new page
    if (finalY2 + 50 > doc.internal.pageSize.height) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERFORMANCE POR ASSESSOR", 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [["Assessor", "ICM Geral %", "ICM Semanal %"]],
        body: assessorRows,
        theme: "striped",
        headStyles: { 
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold"
        },
        styles: { fontSize: 9 },
      });
    } else {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERFORMANCE POR ASSESSOR", 14, finalY2 + 15);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Assessor", "ICM Geral %", "ICM Semanal %"]],
        body: assessorRows,
        theme: "striped",
        headStyles: { 
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold"
        },
        styles: { fontSize: 9 },
      });
    }
  }

  // Gerar arquivo PDF
  const fileName = `relatorio_${visaoFileName}_${selectedMonth.replace("/", "-")}.pdf`;
  doc.save(fileName);

  return fileName;
};

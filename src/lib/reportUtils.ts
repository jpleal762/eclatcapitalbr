import * as XLSX from "xlsx";
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
  const wb = XLSX.utils.book_new();
  const visao = selectedAssessor === "all" ? "Escritório Eclat" : selectedAssessor;
  const visaoFileName = selectedAssessor === "all" 
    ? "escritorio" 
    : selectedAssessor.toLowerCase().replace(/\s+/g, "_");

  // ===== ABA 1: RESUMO =====
  const resumoData = [
    ["RELATÓRIO SEMANAL DE KPIs"],
    [""],
    ["Campo", "Valor"],
    ["Período", selectedMonth.toUpperCase()],
    ["Visão", visao],
    ["Data de Geração", new Date().toLocaleString("pt-BR")],
    [""],
    ["INDICADORES GERAIS"],
    ["ICM Geral", formatPercentage(dashboardData.icmGeral)],
    ["Ritmo Ideal", formatPercentage(dashboardData.ritmoIdeal)],
    ["Dias Úteis Restantes", dashboardData.diasUteisRestantes],
    ["Total Dias Úteis", dashboardData.totalDiasUteis],
    ["Dias Decorridos", dashboardData.diasUteisDecorridos],
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  
  // Ajustar largura das colunas
  wsResumo["!cols"] = [{ wch: 25 }, { wch: 30 }];
  
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // ===== ABA 2: PLANEJAMENTO SEMANAL =====
  const semanalHeader = [
    "KPI",
    "Meta Semanal",
    "Realizado",
    "% Atingido",
    "Falta",
  ];

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

  const wsSemanal = XLSX.utils.aoa_to_sheet([
    ["PLANEJAMENTO SEMANAL ACUMULADO"],
    [""],
    semanalHeader,
    ...semanalRows,
  ]);

  wsSemanal["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSemanal, "Planejamento Semanal");

  // ===== ABA 3: METAS MENSAIS (KPIs) =====
  const mensalHeader = [
    "KPI",
    "Meta Mensal",
    "Realizado",
    "% Atingido",
    "Status",
  ];

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

  const wsMensal = XLSX.utils.aoa_to_sheet([
    ["METAS MENSAIS (KPIs)"],
    [""],
    mensalHeader,
    ...mensalRows,
  ]);

  wsMensal["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsMensal, "Metas Mensais");

  // ===== ABA 4: PERFORMANCE POR ASSESSOR (se visão escritório) =====
  if (selectedAssessor === "all" && dashboardData.assessorPerformance.length > 0) {
    const assessorHeader = [
      "Assessor",
      "ICM Geral %",
      "ICM Semanal %",
    ];

    const assessorRows = dashboardData.assessorPerformance.map((a) => [
      a.fullName || a.name,
      formatPercentage(a.geralPercentage),
      formatPercentage(a.semanaPercentage),
    ]);

    const wsAssessor = XLSX.utils.aoa_to_sheet([
      ["PERFORMANCE POR ASSESSOR"],
      [""],
      assessorHeader,
      ...assessorRows,
    ]);

    wsAssessor["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, wsAssessor, "Performance Assessores");
  }

  // Gerar arquivo
  const fileName = `relatorio_${visaoFileName}_${selectedMonth.replace("/", "-")}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};

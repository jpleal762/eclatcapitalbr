import { KPIRecord, ProcessedKPI, DashboardData, GaugeKPI, AssessorPerformance, MetaSemanal } from "@/types/kpi";
import * as XLSX from "xlsx";

// ============= EXCLUSION LIST (EDITABLE) =============
// Categories to exclude from all dashboard outputs (auxiliary calculation rows)
export const EXCLUDED_CATEGORIES = [
  "PJ até 5 milhões",
  "PJ até 50 milhões",
  "PJ até 500 milhões",
  // Add new auxiliary categories here as needed
];

// ============= STATUS TYPES =============
export const STATUS_TYPES = {
  PLANEJADO_MENSAL: "Planejado Mês",
  PLANEJADO_SEMANAL: "Planejado Semanal",
  REALIZADO: "Realizado",
  PLANEJADO_GERAL: "Planejado Geral",
} as const;

export function parseXLSXFile(buffer: ArrayBuffer): KPIRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<KPIRecord>(worksheet);
  return data;
}

// Filter out auxiliary rows that should not appear in the dashboard
export function filterAuxiliaryRows(data: KPIRecord[]): KPIRecord[] {
  return data.filter(row => 
    !EXCLUDED_CATEGORIES.includes(row.Categorias)
  );
}

// Get the column key (Categorias or Categoria)
function getCategoryKey(record: KPIRecord): string {
  return record.Categorias || (record as any).Categoria || "";
}

export function processKPIData(records: KPIRecord[]): ProcessedKPI[] {
  // Apply exclusion filter first
  const filteredRecords = filterAuxiliaryRows(records);
  
  return filteredRecords.map((record) => {
    const monthlyData: { month: string; value: number }[] = [];
    let total = 0;

    Object.entries(record).forEach(([key, value]) => {
      if (!["Assessor", "Categorias", "Categoria", "Status"].includes(key)) {
        const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
        if (numValue > 0) {
          monthlyData.push({ month: key, value: numValue });
          total += numValue;
        }
      }
    });

    return {
      assessor: record.Assessor,
      category: getCategoryKey(record),
      status: record.Status,
      monthlyData,
      total,
    };
  });
}

export function getUniqueValues(
  data: ProcessedKPI[],
  field: keyof Pick<ProcessedKPI, "assessor" | "category" | "status">
): string[] {
  return [...new Set(data.map((item) => item[field]))].filter(Boolean);
}

export function getAvailableMonths(data: ProcessedKPI[]): string[] {
  const months = new Set<string>();
  data.forEach((record) => {
    record.monthlyData.forEach((m) => months.add(m.month));
  });
  return Array.from(months).sort((a, b) => {
    const [monthA, yearA] = a.split("/");
    const [monthB, yearB] = b.split("/");
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return monthOrder.indexOf(monthA.toLowerCase()) - monthOrder.indexOf(monthB.toLowerCase());
  });
}

export function getWorkingDaysRemaining(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  let workingDays = 0;
  for (let day = today.getDate(); day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

export function getWorkingDaysInMonth(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  let workingDays = 0;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

export function calculateIdealRhythm(): number {
  const totalDays = getWorkingDaysInMonth();
  const remaining = getWorkingDaysRemaining();
  const elapsed = totalDays - remaining;
  return Math.round((elapsed / totalDays) * 100);
}

// ============= DIMENSION FILTERING HELPERS =============

// Filter data by Status - NEVER mix different Status values
export function filterByStatus(data: ProcessedKPI[], statusType: string): ProcessedKPI[] {
  return data.filter(d => {
    const status = d.status.toLowerCase();
    const searchType = statusType.toLowerCase();
    return status.includes(searchType) || status === searchType;
  });
}

// Filter data by Category
export function filterByCategory(data: ProcessedKPI[], category: string): ProcessedKPI[] {
  return data.filter(d => d.category === category);
}

// Filter data by Assessor
export function filterByAssessor(data: ProcessedKPI[], assessor: string): ProcessedKPI[] {
  return data.filter(d => d.assessor === assessor);
}

// Get value for a specific month from records
export function getMonthValue(records: ProcessedKPI[], month: string): number {
  return records.reduce((sum, r) => {
    const monthData = r.monthlyData.find(m => m.month === month);
    return sum + (monthData?.value || 0);
  }, 0);
}

// Check if status is "Planejado" type
function isPlannedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado") || s.includes("meta") || s.includes("planned");
}

// Check if status is "Realizado" type
function isRealizedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("realizado") || s.includes("realized") || s.includes("real.");
}

export function processDashboardData(data: ProcessedKPI[], selectedMonth: string): DashboardData {
  const filteredData = selectedMonth === "all" 
    ? data 
    : data.filter(d => d.monthlyData.some(m => m.month === selectedMonth));

  // IMPORTANT: Separate Status types - NEVER mix them
  const plannedData = filteredData.filter(d => isPlannedStatus(d.status));
  const realizedData = filteredData.filter(d => isRealizedStatus(d.status));

  const totalPlanned = selectedMonth !== "all" 
    ? getMonthValue(plannedData, selectedMonth)
    : plannedData.reduce((sum, d) => sum + d.total, 0);
  
  const totalRealized = selectedMonth !== "all"
    ? getMonthValue(realizedData, selectedMonth)
    : realizedData.reduce((sum, d) => sum + d.total, 0);

  const icmGeral = totalPlanned > 0 ? Math.round((totalRealized / totalPlanned) * 100) : 0;
  const ritmoIdeal = calculateIdealRhythm();
  const diasUteisRestantes = getWorkingDaysRemaining();

  // Group by category for meta semanal - using ONLY realized data
  const categories = [...new Set(filteredData.map(d => d.category))];
  const metaSemanal: MetaSemanal[] = categories.slice(0, 6).map(cat => {
    // Filter by Category first, then aggregate
    const catData = filterByCategory(realizedData, cat);
    const total = selectedMonth !== "all"
      ? getMonthValue(catData, selectedMonth)
      : catData.reduce((sum, d) => sum + d.total, 0);
    return { label: cat, value: total };
  });

  // Assessor performance - separate calculations for each Status type
  const assessors = [...new Set(filteredData.map(d => d.assessor))];
  const assessorPerformance: AssessorPerformance[] = assessors.slice(0, 6).map(assessor => {
    // Filter by Assessor first, then by Status
    const assessorPlanned = filterByAssessor(plannedData, assessor);
    const assessorRealized = filterByAssessor(realizedData, assessor);
    
    const planned = selectedMonth !== "all"
      ? getMonthValue(assessorPlanned, selectedMonth)
      : assessorPlanned.reduce((sum, d) => sum + d.total, 0);
    
    const realized = selectedMonth !== "all"
      ? getMonthValue(assessorRealized, selectedMonth)
      : assessorRealized.reduce((sum, d) => sum + d.total, 0);

    return {
      name: assessor.split(" ").slice(0, 2).join(" "),
      geralPercentage: planned > 0 ? Math.round((realized / planned) * 100) : 0,
      semanaPercentage: planned > 0 ? Math.round((realized / planned) * 80) : 0,
    };
  }).sort((a, b) => b.geralPercentage - a.geralPercentage);

  // Create gauge KPIs from categories - separate planned and realized
  const gaugeKPIs: GaugeKPI[] = categories.slice(0, 6).map(cat => {
    // Filter by Category, then by Status type
    const catPlanned = filterByCategory(plannedData, cat);
    const catRealized = filterByCategory(realizedData, cat);
    
    const target = selectedMonth !== "all"
      ? getMonthValue(catPlanned, selectedMonth)
      : catPlanned.reduce((sum, d) => sum + d.total, 0);
    
    const value = selectedMonth !== "all"
      ? getMonthValue(catRealized, selectedMonth)
      : catRealized.reduce((sum, d) => sum + d.total, 0);

    const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
    const isCurrency = cat.toLowerCase().includes("receita") || cat.toLowerCase().includes("captação");

    return {
      label: cat,
      value,
      target: target || 100,
      percentage,
      isCurrency,
      warning: percentage < 50,
    };
  });

  return {
    icmGeral,
    ritmoIdeal,
    diasUteisRestantes,
    metaSemanalReal: Math.round((totalRealized / (totalPlanned || 1)) * 100),
    metaSemanal,
    assessorPerformance,
    gaugeKPIs,
    headBruno: gaugeKPIs.slice(0, 2),
  };
}

export function formatNumber(num: number, isCurrency = false): string {
  if (isCurrency) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2).replace(".", ",")} Mi`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2).replace(".", ",")} Mil`;
    }
  }
  return num.toLocaleString("pt-BR");
}

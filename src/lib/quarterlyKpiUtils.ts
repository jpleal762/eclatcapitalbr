import { ProcessedKPI } from "@/types/kpi";
import { KPI_CATEGORIES, isBrazilianHoliday } from "./kpiUtils";

// ============= MONTH MAPPING (English → Portuguese) =============
const MONTH_MAP: Record<string, string> = {
  "jan": "jan",
  "feb": "fev",
  "mar": "mar",
  "apr": "abr",
  "may": "mai",
  "jun": "jun",
  "jul": "jul",
  "aug": "ago",
  "sep": "set",
  "oct": "out",
  "nov": "nov",
  "dec": "dez",
  // Portuguese (already correct)
  "fev": "fev",
  "abr": "abr",
  "mai": "mai",
  "ago": "ago",
  "set": "set",
  "out": "out",
  "dez": "dez",
};

// ============= QUARTER DEFINITIONS =============
export const QUARTERS = [
  { label: "Q1 (Jan-Mar)", value: "Q1", months: ["jan", "fev", "mar"], startMonth: 0, endMonth: 2 },
  { label: "Q2 (Abr-Jun)", value: "Q2", months: ["abr", "mai", "jun"], startMonth: 3, endMonth: 5 },
  { label: "Q3 (Jul-Set)", value: "Q3", months: ["jul", "ago", "set"], startMonth: 6, endMonth: 8 },
  { label: "Q4 (Out-Dez)", value: "Q4", months: ["out", "nov", "dez"], startMonth: 9, endMonth: 11 },
];

// ============= QUARTERLY RHYTHM CALCULATION =============
// Get first and last day of a quarter
function getQuarterDateRange(year: number, quarter: string): { start: Date; end: Date } {
  const quarterDef = QUARTERS.find(q => q.value === quarter);
  if (!quarterDef) {
    return { start: new Date(year, 0, 1), end: new Date(year, 2, 31) };
  }
  
  const start = new Date(year, quarterDef.startMonth, 1);
  const end = new Date(year, quarterDef.endMonth + 1, 0); // Last day of the month
  
  return { start, end };
}

// Calculate total business days in a quarter
export function getTotalBusinessDaysInQuarter(year: number, quarter: string): number {
  const { start, end } = getQuarterDateRange(year, quarter);
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

// Calculate elapsed business days in a quarter
export function getElapsedBusinessDaysInQuarter(year: number, quarter: string): number {
  const now = new Date();
  const { start, end } = getQuarterDateRange(year, quarter);
  
  // Quarter in the past → 100% elapsed
  if (end < now) {
    return getTotalBusinessDaysInQuarter(year, quarter);
  }
  
  // Quarter in the future → 0% elapsed
  if (start > now) {
    return 0;
  }
  
  // Current quarter → count up to today
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= now) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

// Calculate quarterly ideal rhythm (percentage)
export function calculateQuarterlyIdealRhythm(year: number, quarter: string): number {
  const total = getTotalBusinessDaysInQuarter(year, quarter);
  const elapsed = getElapsedBusinessDaysInQuarter(year, quarter);
  return total > 0 ? Math.round((elapsed / total) * 100) : 0;
}

// ============= QUARTERLY KPI INTERFACE =============
export interface QuarterlyKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency: boolean;
}

// ============= STATUS HELPERS =============
function isPlannedMonthStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
}

function isRealizedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("realizado") || s.includes("real.") || s === "realizado";
}

// ============= DATA FILTERING HELPERS =============
function filterByCategory(data: ProcessedKPI[], category: string): ProcessedKPI[] {
  return data.filter(d => d.category === category);
}

function filterByAssessor(data: ProcessedKPI[], assessor: string): ProcessedKPI[] {
  if (!assessor || assessor === "all" || assessor === "TODOS") return data;
  return data.filter(d => d.assessor === assessor);
}

// Get sum of values for specific months in a quarter
function getQuarterValue(records: ProcessedKPI[], quarterMonths: string[], year: number): number {
  return records.reduce((sum, r) => {
    const yearSuffix = year.toString().slice(-2);
    const monthSum = r.monthlyData
      .filter(m => {
        // Accept both "/" and "-" as separators
        const separator = m.month.includes("/") ? "/" : "-";
        const parts = m.month.toLowerCase().split(separator);
        if (parts.length !== 2) return false;
        
        const [monthPart, yearPart] = parts;
        // Convert English month to Portuguese
        const normalizedMonth = MONTH_MAP[monthPart] || monthPart;
        
        return quarterMonths.includes(normalizedMonth) && yearPart === yearSuffix;
      })
      .reduce((acc, m) => acc + m.value, 0);
    return sum + monthSum;
  }, 0);
}

// ============= MAIN FUNCTION: PROCESS QUARTERLY DATA =============
export function processQuarterlyDashboardData(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  assessor: string
): QuarterlyKPI[] {
  const filteredData = filterByAssessor(data, assessor);
  const quarterDef = QUARTERS.find(q => q.value === quarter);
  
  if (!quarterDef) return [];

  const quarterMonths = quarterDef.months;

  return KPI_CATEGORIES.map(kpiConfig => {
    const { category, label, isCurrency, isSpecial, targetCategories, actualCategory, additionalActualCategory } = kpiConfig;

    let target = 0;
    let value = 0;

    // Calculate TARGET (Planejado Mês)
    if (isSpecial && targetCategories) {
      // Special case: target from multiple categories (e.g., Receita = PJ1 XP Mês + PJ2 XP Mês)
      targetCategories.forEach(targetCat => {
        const catData = filterByCategory(filteredData, targetCat);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        target += getQuarterValue(plannedData, quarterMonths, year);
      });
    } else {
      // Standard case: target from same category
      const catData = filterByCategory(filteredData, category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      target = getQuarterValue(plannedData, quarterMonths, year);
    }

    // Calculate VALUE (Realizado)
    if (isSpecial && actualCategory) {
      // Special case: actual from different category (e.g., PJ1 XP Mês target, PJ1 XP actual)
      const catData = filterByCategory(filteredData, actualCategory);
      const realizedData = catData.filter(d => isRealizedStatus(d.status));
      value = getQuarterValue(realizedData, quarterMonths, year);
    } else if (category === "Receita") {
      // Special case for Receita: sum Receita + Receita Acumulada
      const receitaData = filterByCategory(filteredData, "Receita");
      const receitaRealizada = receitaData.filter(d => isRealizedStatus(d.status));
      value = getQuarterValue(receitaRealizada, quarterMonths, year);

      const receitaAcumuladaData = filterByCategory(filteredData, "Receita Acumulada");
      const receitaAcumuladaRealizada = receitaAcumuladaData.filter(d => isRealizedStatus(d.status));
      value += getQuarterValue(receitaAcumuladaRealizada, quarterMonths, year);
    } else {
      // Standard case: actual from same category
      const catData = filterByCategory(filteredData, category);
      const realizedData = catData.filter(d => isRealizedStatus(d.status));
      value = getQuarterValue(realizedData, quarterMonths, year);
    }

    // Add additional actual category if exists (e.g., Receita Empilhada)
    if (additionalActualCategory) {
      const additionalData = filterByCategory(filteredData, additionalActualCategory);
      const additionalRealized = additionalData.filter(d => isRealizedStatus(d.status));
      value += getQuarterValue(additionalRealized, quarterMonths, year);
    }

    const percentage = target > 0 ? Math.round((value / target) * 100) : 0;

    return {
      label,
      value,
      target,
      percentage,
      isCurrency: isCurrency ?? false,
    };
  });
}

// ============= GET CURRENT QUARTER =============
export function getCurrentQuarter(): string {
  const month = new Date().getMonth();
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
}

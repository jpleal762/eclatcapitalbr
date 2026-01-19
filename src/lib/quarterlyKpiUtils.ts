import { ProcessedKPI } from "@/types/kpi";
import { KPI_CATEGORIES } from "./kpiUtils";

// ============= QUARTER DEFINITIONS =============
export const QUARTERS = [
  { label: "Q1 (Jan-Mar)", value: "Q1", months: ["jan", "fev", "mar"] },
  { label: "Q2 (Abr-Jun)", value: "Q2", months: ["abr", "mai", "jun"] },
  { label: "Q3 (Jul-Set)", value: "Q3", months: ["jul", "ago", "set"] },
  { label: "Q4 (Out-Dez)", value: "Q4", months: ["out", "nov", "dez"] },
];

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
        const [monthPart, yearPart] = m.month.toLowerCase().split("/");
        return quarterMonths.includes(monthPart) && yearPart === yearSuffix;
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

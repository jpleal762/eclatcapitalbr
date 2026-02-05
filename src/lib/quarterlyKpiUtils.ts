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

// ============= ASSESSOR GAP INTERFACE =============
export interface AssessorQuarterlyGap {
  name: string;           // Primeiro nome do assessor
  gap: number;            // Valor absoluto que falta para o ritmo
  gapPercentage: number;  // Gap em pontos percentuais
}

// ============= MONTHLY GAP DATA FOR BAR VISUALIZATION =============
export interface MonthlyGapData {
  position: number;          // 33.33 ou 66.66 (percentual na barra)
  monthLabel: string;        // "Jan", "Fev", etc.
  monthIndex: number;        // 0, 1 (mês dentro do trimestre)
  cumulativeGap: number;     // Gap acumulado até este mês
  isCurrency: boolean;
  showGap: boolean;          // Se deve mostrar (baseado na posição da barra e mês atual)
}

// ============= STATUS HELPERS =============
function isPlannedMonthStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
}

function isPlannedWeekStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado s") || s === "planejado semana" || s.includes("planejado sem");
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

// ============= CALCULATE ASSESSOR GAPS FOR KPI =============
interface KPIConfig {
  category: string;
  label: string;
  isCurrency?: boolean;
  isSpecial?: boolean;
  targetCategories?: string[];
  actualCategory?: string;
  additionalActualCategory?: string;
}

export function calculateAssessorGapsForKPI(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  kpiConfig: KPIConfig,
  ritmoIdeal: number
): AssessorQuarterlyGap[] {
  const quarterDef = QUARTERS.find(q => q.value === quarter);
  if (!quarterDef || ritmoIdeal <= 0) return [];

  const quarterMonths = quarterDef.months;
  const { category, isSpecial, targetCategories, actualCategory, additionalActualCategory } = kpiConfig;

  // Get unique assessors from data
  const assessors = [...new Set(data.map(d => d.assessor))].filter(Boolean);

  const assessorGaps: AssessorQuarterlyGap[] = [];

  for (const assessor of assessors) {
    const assessorData = data.filter(d => d.assessor === assessor);
    
    let target = 0;
    let value = 0;

    // Calculate TARGET (same logic as processQuarterlyDashboardData)
    if (isSpecial && targetCategories) {
      targetCategories.forEach(targetCat => {
        const catData = assessorData.filter(d => d.category === targetCat);
        const plannedData = catData.filter(d => {
          const s = d.status.toLowerCase();
          return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
        });
        target += getQuarterValue(plannedData, quarterMonths, year);
      });
    } else {
      const catData = assessorData.filter(d => d.category === category);
      const plannedData = catData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
      });
      target = getQuarterValue(plannedData, quarterMonths, year);
    }

    // Calculate VALUE (same logic as processQuarterlyDashboardData)
    if (isSpecial && actualCategory) {
      const catData = assessorData.filter(d => d.category === actualCategory);
      const realizedData = catData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("realizado") || s.includes("real.") || s === "realizado";
      });
      value = getQuarterValue(realizedData, quarterMonths, year);
    } else if (category === "Receita") {
      const receitaData = assessorData.filter(d => d.category === "Receita");
      const receitaRealizada = receitaData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("realizado") || s.includes("real.") || s === "realizado";
      });
      value = getQuarterValue(receitaRealizada, quarterMonths, year);

      const receitaAcumuladaData = assessorData.filter(d => d.category === "Receita Acumulada");
      const receitaAcumuladaRealizada = receitaAcumuladaData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("realizado") || s.includes("real.") || s === "realizado";
      });
      value += getQuarterValue(receitaAcumuladaRealizada, quarterMonths, year);
    } else {
      const catData = assessorData.filter(d => d.category === category);
      const realizedData = catData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("realizado") || s.includes("real.") || s === "realizado";
      });
      value = getQuarterValue(realizedData, quarterMonths, year);
    }

    // Add additional actual category if exists
    if (additionalActualCategory) {
      const additionalData = assessorData.filter(d => d.category === additionalActualCategory);
      const additionalRealized = additionalData.filter(d => {
        const s = d.status.toLowerCase();
        return s.includes("realizado") || s.includes("real.") || s === "realizado";
      });
      value += getQuarterValue(additionalRealized, quarterMonths, year);
    }

    // Calculate gap vs ideal rhythm
    if (target > 0) {
      const valorEsperadoRitmo = target * (ritmoIdeal / 100);
      const gap = Math.max(0, valorEsperadoRitmo - value);
      
      if (gap > 0) {
        // Get first name only
        const firstName = assessor.split(" ")[0].toUpperCase();
        const gapPercentage = Math.round((gap / target) * 100);
        
        assessorGaps.push({
          name: firstName,
          gap,
          gapPercentage,
        });
      }
    }
  }

  // Sort by gap descending and return top 2
  return assessorGaps
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2);
}

// ============= CALCULATE MONTHLY GAPS FOR BAR VISUALIZATION =============
interface KPIConfig {
  category: string;
  label: string;
  isCurrency?: boolean;
  isSpecial?: boolean;
  targetCategories?: string[];
  actualCategory?: string;
  additionalActualCategory?: string;
}

/**
 * Calculate accumulated monthly gaps for displaying below the month dividers in quarterly bars
 * Shows gap at month 1 (33.33%) and month 2 (66.66%) positions
 * Only shows if:
 * 1. The progress bar is before that position
 * 2. We are in that month or past it
 */
export function calculateMonthlyGapsForBar(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  kpiConfig: KPIConfig,
  currentPercentage: number,
  assessor: string = "all"
): MonthlyGapData[] {
  const quarterDef = QUARTERS.find(q => q.value === quarter);
  if (!quarterDef) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-11
  
  // Get month indices for this quarter (e.g., Q1 = [0, 1, 2])
  const quarterMonthIndices = [
    quarterDef.startMonth,
    quarterDef.startMonth + 1,
    quarterDef.startMonth + 2
  ];
  
  // Determine which month of the quarter we're currently in
  // -1 = before quarter, 0 = month 1, 1 = month 2, 2 = month 3, 3 = after quarter
  let currentQuarterMonth = -1;
  if (currentYear === year) {
    if (currentMonthIndex >= quarterDef.startMonth && currentMonthIndex <= quarterDef.endMonth) {
      currentQuarterMonth = currentMonthIndex - quarterDef.startMonth;
    } else if (currentMonthIndex > quarterDef.endMonth) {
      currentQuarterMonth = 3; // Past quarter
    }
  } else if (currentYear > year) {
    currentQuarterMonth = 3; // Past quarter
  }
  
  const yearSuffix = year.toString().slice(-2);
  const { category, isSpecial, targetCategories, actualCategory, additionalActualCategory } = kpiConfig;
  
  // Filter data by assessor
  const filteredData = assessor === "all" ? data : data.filter(d => d.assessor === assessor);
  
  // Calculate gap for each month in the quarter
  const monthlyGaps: { monthLabel: string; gap: number }[] = [];
  
  for (let i = 0; i < 3; i++) {
    const monthName = quarterDef.months[i];
    
    let target = 0;
    let actual = 0;
    
    // Calculate TARGET
    if (isSpecial && targetCategories) {
      targetCategories.forEach(targetCat => {
        const catData = filteredData.filter(d => d.category === targetCat);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        target += getMonthValueFlexible(plannedData, monthName, yearSuffix);
      });
    } else {
      const catData = filteredData.filter(d => d.category === category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      target = getMonthValueFlexible(plannedData, monthName, yearSuffix);
    }
    
    // Calculate ACTUAL
    if (isSpecial && actualCategory) {
      const catData = filteredData.filter(d => d.category === actualCategory);
      const realizedData = catData.filter(d => isRealizedStatus(d.status));
      actual = getMonthValueFlexible(realizedData, monthName, yearSuffix);
    } else if (category === "Receita") {
      const receitaData = filteredData.filter(d => d.category === "Receita");
      const receitaRealized = receitaData.filter(d => isRealizedStatus(d.status));
      actual = getMonthValueFlexible(receitaRealized, monthName, yearSuffix);
      
      const receitaAcumuladaData = filteredData.filter(d => d.category === "Receita Acumulada");
      const receitaAcumuladaRealized = receitaAcumuladaData.filter(d => isRealizedStatus(d.status));
      actual += getMonthValueFlexible(receitaAcumuladaRealized, monthName, yearSuffix);
    } else {
      const catData = filteredData.filter(d => d.category === category);
      const realizedData = catData.filter(d => isRealizedStatus(d.status));
      actual = getMonthValueFlexible(realizedData, monthName, yearSuffix);
    }
    
    // Add additional actual category if exists
    if (additionalActualCategory) {
      const additionalData = filteredData.filter(d => d.category === additionalActualCategory);
      const additionalRealized = additionalData.filter(d => isRealizedStatus(d.status));
      actual += getMonthValueFlexible(additionalRealized, monthName, yearSuffix);
    }
    
    // Gap = max(0, target - actual)
    const gap = Math.max(0, target - actual);
    
    // Debug log for verification
    console.log(`[GAP DEBUG] ${kpiConfig.label} - ${monthName}/${yearSuffix}:`, {
      target,
      actual,
      gap
    });
    
    // Capitalize first letter
    const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    monthlyGaps.push({ monthLabel, gap });
  }
  
  // Build result for first 2 months (positions 33.33% and 66.66%)
  const result: MonthlyGapData[] = [];
  
  for (let i = 0; i < 2; i++) {
    const position = i === 0 ? 33.33 : 66.66;
    
    // Calculate cumulative gap up to this month (inclusive)
    let cumulativeGap = 0;
    for (let j = 0; j <= i; j++) {
      cumulativeGap += monthlyGaps[j].gap;
    }
    
    // Show gap if:
    // 1. Current bar percentage is before this position (we haven't reached this point yet)
    // 2. We are at or past this month in the quarter
    const barBeforePosition = currentPercentage < position;
    const atOrPastThisMonth = currentQuarterMonth >= i;
    const showGap = barBeforePosition && atOrPastThisMonth && cumulativeGap > 0;
    
    result.push({
      position,
      monthLabel: monthlyGaps[i].monthLabel,
      monthIndex: i,
      cumulativeGap,
      isCurrency: kpiConfig.isCurrency ?? false,
      showGap,
    });
  }
  
  return result;
}

// Helper to get month value with flexible key format and month normalization
function getMonthValueFlexible(records: ProcessedKPI[], monthName: string, yearSuffix: string): number {
  return records.reduce((sum, r) => {
    const monthData = r.monthlyData.find(m => {
      // Support both "/" and "-" separators
      const sep = m.month.includes("/") ? "/" : "-";
      const parts = m.month.toLowerCase().split(sep);
      if (parts.length !== 2) return false;
      
      let [mStr, yStr] = parts;
      // Normalize month to Portuguese using MONTH_MAP
      mStr = MONTH_MAP[mStr] || mStr;
      
      return mStr === monthName.toLowerCase() && yStr === yearSuffix;
    });
    return sum + (monthData?.value || 0);
  }, 0);
}

// ============= WEEKLY GAP INTERFACE =============
export interface WeeklyGapData {
  target: number;      // Meta da semana
  realized: number;    // Realizado
  gap: number;         // Falta para meta da semana
  isCurrency: boolean;
}

// ============= CALCULATE WEEKLY GAP FOR KPI =============
export function calculateWeeklyGapForKPI(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  kpiConfig: KPIConfig,
  assessor: string = "all"
): WeeklyGapData {
  const quarterDef = QUARTERS.find(q => q.value === quarter);
  if (!quarterDef) return { target: 0, realized: 0, gap: 0, isCurrency: kpiConfig.isCurrency ?? false };

  // Get current month in Portuguese format
  const now = new Date();
  const monthIndex = now.getMonth();
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const currentMonthName = monthNames[monthIndex];
  const yearSuffix = year.toString().slice(-2);
  
  const { category, isSpecial, targetCategories, actualCategory, additionalActualCategory } = kpiConfig;
  
  // Filter data by assessor
  const filteredData = assessor === "all" ? data : data.filter(d => d.assessor === assessor);
  
  let weeklyTarget = 0;
  let realized = 0;
  
  // Calculate WEEKLY TARGET (Planejado Semana)
  if (isSpecial && targetCategories) {
    targetCategories.forEach(targetCat => {
      const catData = filteredData.filter(d => d.category === targetCat);
      const plannedData = catData.filter(d => isPlannedWeekStatus(d.status));
      weeklyTarget += getMonthValueFlexible(plannedData, currentMonthName, yearSuffix);
    });
  } else {
    const catData = filteredData.filter(d => d.category === category);
    const plannedData = catData.filter(d => isPlannedWeekStatus(d.status));
    weeklyTarget = getMonthValueFlexible(plannedData, currentMonthName, yearSuffix);
  }
  
  // Calculate REALIZED
  if (isSpecial && actualCategory) {
    const catData = filteredData.filter(d => d.category === actualCategory);
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    realized = getMonthValueFlexible(realizedData, currentMonthName, yearSuffix);
  } else if (category === "Receita") {
    const receitaData = filteredData.filter(d => d.category === "Receita");
    const receitaRealized = receitaData.filter(d => isRealizedStatus(d.status));
    realized = getMonthValueFlexible(receitaRealized, currentMonthName, yearSuffix);
    
    const receitaAcumuladaData = filteredData.filter(d => d.category === "Receita Acumulada");
    const receitaAcumuladaRealized = receitaAcumuladaData.filter(d => isRealizedStatus(d.status));
    realized += getMonthValueFlexible(receitaAcumuladaRealized, currentMonthName, yearSuffix);
  } else {
    const catData = filteredData.filter(d => d.category === category);
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    realized = getMonthValueFlexible(realizedData, currentMonthName, yearSuffix);
  }
  
  // Add additional actual category if exists (e.g., Receita Empilhada)
  if (additionalActualCategory) {
    const additionalData = filteredData.filter(d => d.category === additionalActualCategory);
    const additionalRealized = additionalData.filter(d => isRealizedStatus(d.status));
    realized += getMonthValueFlexible(additionalRealized, currentMonthName, yearSuffix);
  }
  
  const gap = Math.max(0, weeklyTarget - realized);
  
  return {
    target: weeklyTarget,
    realized,
    gap,
    isCurrency: kpiConfig.isCurrency ?? false,
  };
}

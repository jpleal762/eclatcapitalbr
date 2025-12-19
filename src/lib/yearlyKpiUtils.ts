import { ProcessedKPI, GaugeKPI, AssessorPerformance, YearlyDashboardData, KPIStatusIcon } from "@/types/kpi";
import { 
  filterByCategory, 
  filterByAssessor, 
  KPI_WEIGHTS, 
  ICM_PERCENTAGE_CAP,
  getKPIStatusIcon 
} from "./kpiUtils";

// ============= BRAZILIAN HOLIDAYS (YEARLY) =============
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function isBrazilianHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const fixedHolidays = [
    { month: 1, day: 1 },
    { month: 4, day: 21 },
    { month: 5, day: 1 },
    { month: 9, day: 7 },
    { month: 10, day: 12 },
    { month: 11, day: 2 },
    { month: 11, day: 15 },
    { month: 12, day: 25 },
  ];

  if (fixedHolidays.some(h => h.month === month && h.day === day)) return true;

  const easterDate = calculateEaster(year);
  
  const carnival = new Date(easterDate);
  carnival.setDate(carnival.getDate() - 47);
  
  const goodFriday = new Date(easterDate);
  goodFriday.setDate(goodFriday.getDate() - 2);
  
  const corpusChristi = new Date(easterDate);
  corpusChristi.setDate(corpusChristi.getDate() + 60);

  const variableHolidays = [carnival, goodFriday, corpusChristi];
  
  return variableHolidays.some(holiday => 
    holiday.getFullYear() === year &&
    holiday.getMonth() + 1 === month &&
    holiday.getDate() === day
  );
}

// ============= YEARLY BUSINESS DAY CALCULATIONS =============
export function getTotalBusinessDaysInYear(year: number): number {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  let businessDays = 0;
  const current = new Date(startOfYear);
  
  while (current <= endOfYear) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function getElapsedBusinessDaysInYear(currentDate: Date, year: number): number {
  // If viewing past year, return total business days in that year
  if (year < currentDate.getFullYear()) {
    return getTotalBusinessDaysInYear(year);
  }
  
  // If viewing future year, return 0
  if (year > currentDate.getFullYear()) {
    return 0;
  }
  
  // Current year: calculate from Jan 1 to today
  const startOfYear = new Date(year, 0, 1);
  const today = new Date(currentDate);
  
  let businessDays = 0;
  const current = new Date(startOfYear);
  
  while (current <= today) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function getRemainingBusinessDaysInYear(currentDate: Date, year: number): number {
  // If viewing past year, return 0
  if (year < currentDate.getFullYear()) {
    return 0;
  }
  
  // If viewing future year, return total business days in that year
  if (year > currentDate.getFullYear()) {
    return getTotalBusinessDaysInYear(year);
  }
  
  // Current year: calculate remaining from today to end of year
  const today = new Date(currentDate);
  const endOfYear = new Date(year, 11, 31);
  
  let businessDays = 0;
  const current = new Date(today);
  current.setDate(current.getDate() + 1);
  
  while (current <= endOfYear) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function calculateYearlyIdealRhythm(currentDate: Date, year: number): number {
  const total = getTotalBusinessDaysInYear(year);
  const elapsed = getElapsedBusinessDaysInYear(currentDate, year);
  return total > 0 ? Math.round((elapsed / total) * 100) : 0;
}

// ============= YEARLY DATA FILTERING =============
function getYearFromMonth(monthStr: string): number | null {
  if (!monthStr || typeof monthStr !== 'string') return null;
  const parts = monthStr.toLowerCase().trim().split("/");
  if (parts.length !== 2) return null;
  const yearPart = parts[1].trim();
  let year = parseInt(yearPart, 10);
  if (isNaN(year)) return null;
  if (year < 100) year += 2000;
  return year;
}

function getYearlyValue(records: ProcessedKPI[], year: number): number {
  return records.reduce((sum, r) => {
    const yearValue = r.monthlyData
      .filter(m => getYearFromMonth(m.month) === year)
      .reduce((s, m) => s + m.value, 0);
    return sum + yearValue;
  }, 0);
}

function isPlannedMonthStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
}

function isRealizedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("realizado") || s.includes("real.") || s === "realizado";
}

// ============= YEARLY ICM CALCULATIONS =============
export function calculateYearlyICMGeral(data: ProcessedKPI[], year: number): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const target = getYearlyValue(plannedData, year);
    const actual = getYearlyValue(realizedData, year);

    if (target > 0) {
      const rawAchievementPct = (actual / target) * 100;
      const cappedPct = Math.min(rawAchievementPct, ICM_PERCENTAGE_CAP);
      weightedSum += cappedPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function calculateYearlyICMRitmo(
  data: ProcessedKPI[], 
  year: number, 
  currentDate: Date
): number {
  const totalBusinessDays = getTotalBusinessDaysInYear(year);
  const elapsedBusinessDays = getElapsedBusinessDaysInYear(currentDate, year);
  const paceRatio = totalBusinessDays > 0 ? elapsedBusinessDays / totalBusinessDays : 0;

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const target = getYearlyValue(plannedData, year);
    const actual = getYearlyValue(realizedData, year);
    const expectedAtPace = target * paceRatio;

    if (expectedAtPace > 0) {
      const rawPaceAchievementPct = (actual / expectedAtPace) * 100;
      const cappedPct = Math.min(rawPaceAchievementPct, ICM_PERCENTAGE_CAP);
      weightedSum += cappedPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ============= YEARLY KPI CATEGORIES =============
// Same structure as monthly (9 KPIs) + 1 NEW (Receita PJ2 XP with special calculation)
// KPI 2 (Receita) has special yearly calculation: Actual = Receita + Receita Acumulada
// KPI 10 (NEW - Receita PJ2 XP Anual) = Target: PJ2 XP Mes + PJ2 XP, Actual: PJ2 XP + Receita Acumulada
const YEARLY_KPI_CATEGORIES = [
  // Graph 1: Captação NET - Same as monthly
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  // Graph 2: Receita - Modified for yearly (Actual = Receita + Receita Acumulada)
  { category: "Receita", label: "Receita", isCurrency: true, isReceitaYearly: true },
  // Graph 3: Primeiras Reuniões - Same as monthly
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  // Graph 4: Diversificação - Same as monthly
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  // Graph 5: Receita Parceiros - Same as monthly
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  // Graph 6: Receita PJ1 XP - Same as monthly (Target: PJ1 XP Mês, Actual: PJ1 XP)
  { category: "PJ1 XP Mês", label: "Receita PJ1 XP", isCurrency: true, actualCategory: "PJ1 XP" },
  // Graph 7: Receita PJ2 XP - Same as monthly (Target: PJ2 XP Mês, Actual: PJ2 XP)
  { category: "PJ2 XP Mês", label: "Receita PJ2 XP", isCurrency: true, actualCategory: "PJ2 XP" },
  // Graph 8: Habilitação - Same as monthly
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  // Graph 9: Ativação - Same as monthly
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];

// ============= MAIN YEARLY DASHBOARD PROCESSOR =============
export function processYearlyDashboardData(
  data: ProcessedKPI[], 
  selectedYear: number, 
  selectedAssessor: string = "all"
): YearlyDashboardData {
  const currentDate = new Date();
  const filteredByAssessor = filterByAssessor(data, selectedAssessor);
  
  const icmGeral = calculateYearlyICMGeral(filteredByAssessor, selectedYear);
  const ritmoIdeal = calculateYearlyIdealRhythm(currentDate, selectedYear);
  const diasUteisRestantes = getRemainingBusinessDaysInYear(currentDate, selectedYear);

  // Assessor Performance - Always show all assessors (ignores filter)
  const allAssessors = [...new Set(data.map(d => d.assessor))];
  const assessorPerformance: AssessorPerformance[] = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    const icm = calculateYearlyICMGeral(assessorData, selectedYear);
    return {
      name: assessor.split(" ").slice(0, 2).join(" "),
      fullName: assessor,
      geralPercentage: icm,
      semanaPercentage: Math.round(icm * 0.8),
    };
  }).sort((a, b) => b.geralPercentage - a.geralPercentage);

  // Yearly Gauge KPIs - Same structure as monthly but aggregated by year
  const gaugeKPIs: GaugeKPI[] = YEARLY_KPI_CATEGORIES.map(kpi => {
    let target: number;
    let value: number;

    // Graph 2: Receita - Special yearly calculation
    // Target = PJ1 XP Mês + PJ2 XP Mês (Planejado Mes)
    // Actual = Receita + Receita Acumulada (Realizado)
    if ((kpi as any).isReceitaYearly) {
      // Target from PJ1 XP Mês + PJ2 XP Mês
      const targetCategories = ["PJ1 XP Mês", "PJ2 XP Mês"];
      target = targetCategories.reduce((sum, cat) => {
        const catData = filterByCategory(filteredByAssessor, cat);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        return sum + getYearlyValue(plannedData, selectedYear);
      }, 0);

      // Actual from Receita + Receita Acumulada
      const actualCategories = ["Receita", "Receita Acumulada"];
      value = actualCategories.reduce((sum, cat) => {
        const catData = filterByCategory(filteredByAssessor, cat);
        const realizedData = catData.filter(d => isRealizedStatus(d.status));
        return sum + getYearlyValue(realizedData, selectedYear);
      }, 0);
    }
    // Graphs 6 & 7: PJ1 XP and PJ2 XP - Target from "Mês" category, Actual from base category
    else if ((kpi as any).actualCategory) {
      const actualCategory = (kpi as any).actualCategory as string;
      
      // Target from PJ1 XP Mês or PJ2 XP Mês (Planejado Mes)
      const catData = filterByCategory(filteredByAssessor, kpi.category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      target = getYearlyValue(plannedData, selectedYear);
      
      // Actual from PJ1 XP or PJ2 XP (Realizado)
      const actualData = filterByCategory(filteredByAssessor, actualCategory);
      const realizedData = actualData.filter(d => isRealizedStatus(d.status));
      value = getYearlyValue(realizedData, selectedYear);
    }
    else {
      // Standard case: target and actual from same category (same as monthly)
      const catData = filterByCategory(filteredByAssessor, kpi.category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      const realizedData = catData.filter(d => isRealizedStatus(d.status));

      target = getYearlyValue(plannedData, selectedYear);
      value = getYearlyValue(realizedData, selectedYear);
    }

    const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
    const statusIcon = getKPIStatusIcon(percentage, ritmoIdeal);

    return {
      label: kpi.label,
      value,
      target: target || 0,
      percentage,
      isCurrency: kpi.isCurrency,
      warning: percentage < 50,
      statusIcon,
    };
  });

  return {
    icmGeral,
    ritmoIdeal,
    diasUteisRestantes,
    assessorPerformance,
    gaugeKPIs,
  };
}

// Get available years from data
export function getAvailableYears(data: ProcessedKPI[]): number[] {
  const years = new Set<number>();

  data.forEach((record) => {
    record.monthlyData.forEach((m) => {
      const monthKey = String(m.month ?? "");
      const parts = monthKey.split("/");
      if (parts.length !== 2) return;

      const yearRaw = parseInt(parts[1], 10);
      if (Number.isNaN(yearRaw)) return;

      const year = yearRaw < 100 ? yearRaw + 2000 : yearRaw;
      years.add(year);
    });
  });

  return Array.from(years).sort((a, b) => b - a);
}

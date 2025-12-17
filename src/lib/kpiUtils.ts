import { KPIRecord, ProcessedKPI, DashboardData, GaugeKPI, AssessorPerformance, MetaSemanal } from "@/types/kpi";
import * as XLSX from "xlsx";

// ============= EXCLUSION LIST (EDITABLE) =============
export const EXCLUDED_CATEGORIES = [
  "PJ>500M",
  "PJ>50M",
  "PJ>5M",
  "PF>300K",
  "PF>1M",
];

// ============= STATUS TYPES =============
export const STATUS_TYPES = {
  PLANEJADO_MES: "Planejado Mês",
  PLANEJADO_SEMANA: "Planejado Semana",
  REALIZADO: "Realizado",
  PLANEJADO_GERAL: "Planejado Geral",
} as const;

// ============= KPI WEIGHTS FOR ICM CALCULATION =============
export const KPI_WEIGHTS: Record<string, number> = {
  "Captação net": 2,
  "Receita": 2,
  "Parceiros Tri": 2,
  "Primeira Reunião": 1,
  "Diversificada ( ROA>1,5)": 1,
  "Habilitacao": 1,
  "Ativacao": 1,
};

// ============= KPI CATEGORIES FOR GAUGES =============
// Note: Receita is special - target comes from PJ1 XP Mês + PJ2 XP Mês
export const KPI_CATEGORIES = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true, isSpecial: true, targetCategories: ["PJ1 XP Mês", "PJ2 XP Mês"] },
  { category: "Primeira Reunião", label: "Primeira Reunião", isCurrency: false },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: false },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  { category: "PJ1 XP Mês", label: "Receita PJ1 XP", isCurrency: true },
  { category: "PJ2 XP Mês", label: "Receita PJ2 XP", isCurrency: true },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];

export function parseXLSXFile(buffer: ArrayBuffer): KPIRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<KPIRecord>(worksheet);
  return data;
}

export function filterAuxiliaryRows(data: KPIRecord[]): KPIRecord[] {
  return data.filter(row => 
    !EXCLUDED_CATEGORIES.includes(row.Categorias)
  );
}

function getCategoryKey(record: KPIRecord): string {
  return record.Categorias || (record as any).Categoria || "";
}

export function processKPIData(records: KPIRecord[]): ProcessedKPI[] {
  const filteredRecords = filterAuxiliaryRows(records);
  
  return filteredRecords.map((record) => {
    const monthlyData: { month: string; value: number }[] = [];
    let total = 0;

    Object.entries(record).forEach(([key, value]) => {
      if (!["Assessor", "Categorias", "Categoria", "Status"].includes(key)) {
        const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
        if (numValue !== 0) {
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

// ============= BRAZILIAN HOLIDAYS =============
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

export function getWorkingDaysRemaining(currentDate: Date = new Date()): number {
  const today = new Date(currentDate);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  let businessDays = 0;
  let current = new Date(today);
  current.setDate(current.getDate() + 1);
  
  while (current <= lastDayOfMonth) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function getElapsedBusinessDays(currentDate: Date = new Date()): number {
  const today = new Date(currentDate);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  let businessDays = 0;
  let current = new Date(firstDayOfMonth);
  
  while (current <= today) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function getTotalBusinessDaysInMonth(date: Date = new Date()): number {
  return getElapsedBusinessDays(date) + getWorkingDaysRemaining(date);
}

export function calculateIdealRhythm(currentDate: Date = new Date()): number {
  const totalDays = getTotalBusinessDaysInMonth(currentDate);
  const elapsed = getElapsedBusinessDays(currentDate);
  return totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 0;
}

// ============= STATUS HELPERS =============
function matchesStatus(status: string, targetStatus: string): boolean {
  const s = status.toLowerCase().trim();
  const t = targetStatus.toLowerCase().trim();
  return s === t || s.includes(t) || t.includes(s);
}

function isPlannedMonthStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
}

function isPlannedWeekStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado s") || s === "planejado semana";
}

function isRealizedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("realizado") || s.includes("real.") || s === "realizado";
}

// ============= DATA FILTERING HELPERS =============
export function filterByStatus(data: ProcessedKPI[], statusType: string): ProcessedKPI[] {
  return data.filter(d => matchesStatus(d.status, statusType));
}

export function filterByCategory(data: ProcessedKPI[], category: string): ProcessedKPI[] {
  return data.filter(d => d.category === category);
}

export function filterByAssessor(data: ProcessedKPI[], assessor: string): ProcessedKPI[] {
  if (!assessor || assessor === "all" || assessor === "TODOS") return data;
  return data.filter(d => d.assessor === assessor);
}

export function getMonthValue(records: ProcessedKPI[], month: string): number {
  return records.reduce((sum, r) => {
    const monthData = r.monthlyData.find(m => m.month === month);
    return sum + (monthData?.value || 0);
  }, 0);
}

// ============= ICM CALCULATIONS =============
export function calculateICMGeral(data: ProcessedKPI[], month: string): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const target = month !== "all" ? getMonthValue(plannedData, month) : plannedData.reduce((s, d) => s + d.total, 0);
    const actual = month !== "all" ? getMonthValue(realizedData, month) : realizedData.reduce((s, d) => s + d.total, 0);

    if (target > 0) {
      const achievementPct = (actual / target) * 100;
      weightedSum += achievementPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function calculateICMRitmo(data: ProcessedKPI[], month: string, currentDate: Date = new Date()): number {
  const totalBusinessDays = getTotalBusinessDaysInMonth(currentDate);
  const elapsedBusinessDays = getElapsedBusinessDays(currentDate);
  const paceRatio = totalBusinessDays > 0 ? elapsedBusinessDays / totalBusinessDays : 0;

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const target = month !== "all" ? getMonthValue(plannedData, month) : plannedData.reduce((s, d) => s + d.total, 0);
    const actual = month !== "all" ? getMonthValue(realizedData, month) : realizedData.reduce((s, d) => s + d.total, 0);
    
    const expectedAtPace = target * paceRatio;

    if (expectedAtPace > 0) {
      const paceAchievementPct = (actual / expectedAtPace) * 100;
      weightedSum += paceAchievementPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ============= MAIN DASHBOARD PROCESSOR =============
export function processDashboardData(
  data: ProcessedKPI[], 
  selectedMonth: string, 
  selectedAssessor: string = "all"
): DashboardData {
  const filteredByAssessor = filterByAssessor(data, selectedAssessor);
  const currentDate = new Date();
  
  const icmGeral = calculateICMGeral(filteredByAssessor, selectedMonth);
  const ritmoIdeal = calculateICMRitmo(filteredByAssessor, selectedMonth, currentDate);
  const diasUteisRestantes = getWorkingDaysRemaining(currentDate);

  // Meta Semanal - Using Planejado Semana status
  const metaSemanal: MetaSemanal[] = KPI_CATEGORIES.slice(0, 6).map(kpi => {
    const catData = filterByCategory(filteredByAssessor, kpi.category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const value = selectedMonth !== "all" 
      ? getMonthValue(weeklyPlanned, selectedMonth)
      : weeklyPlanned.reduce((s, d) => s + d.total, 0);
    return { label: kpi.label, value };
  });

  // Assessor Performance - Always show all assessors (ignores filter)
  const allAssessors = [...new Set(data.map(d => d.assessor))];
  const assessorPerformance: AssessorPerformance[] = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    const icm = calculateICMGeral(assessorData, selectedMonth);
    return {
      name: assessor.split(" ").slice(0, 2).join(" "),
      fullName: assessor,
      geralPercentage: icm,
      semanaPercentage: Math.round(icm * 0.8),
    };
  }).sort((a, b) => b.geralPercentage - a.geralPercentage);

  // Gauge KPIs
  const gaugeKPIs: GaugeKPI[] = KPI_CATEGORIES.map(kpi => {
    let target: number;
    let value: number;

    // Special case for Receita: target comes from PJ1 XP Mês + PJ2 XP Mês
    if ((kpi as any).isSpecial && (kpi as any).targetCategories) {
      const targetCategories = (kpi as any).targetCategories as string[];
      target = targetCategories.reduce((sum, cat) => {
        const catData = filterByCategory(filteredByAssessor, cat);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        return sum + (selectedMonth !== "all" 
          ? getMonthValue(plannedData, selectedMonth)
          : plannedData.reduce((s, d) => s + d.total, 0));
      }, 0);

      // Actual comes from Receita category
      const realizedData = filterByCategory(filteredByAssessor, kpi.category).filter(d => isRealizedStatus(d.status));
      value = selectedMonth !== "all"
        ? getMonthValue(realizedData, selectedMonth)
        : realizedData.reduce((s, d) => s + d.total, 0);
    } else {
      // Standard case: target and actual from same category
      const catData = filterByCategory(filteredByAssessor, kpi.category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      const realizedData = catData.filter(d => isRealizedStatus(d.status));

      target = selectedMonth !== "all" 
        ? getMonthValue(plannedData, selectedMonth)
        : plannedData.reduce((s, d) => s + d.total, 0);
      
      value = selectedMonth !== "all"
        ? getMonthValue(realizedData, selectedMonth)
        : realizedData.reduce((s, d) => s + d.total, 0);
    }

    const percentage = target > 0 ? Math.round((value / target) * 100) : 0;

    return {
      label: kpi.label,
      value,
      target: target || 0,
      percentage,
      isCurrency: kpi.isCurrency,
      warning: percentage < 50,
    };
  });

  return {
    icmGeral,
    ritmoIdeal,
    diasUteisRestantes,
    metaSemanalReal: icmGeral,
    metaSemanal,
    assessorPerformance,
    gaugeKPIs,
    headBruno: gaugeKPIs.slice(0, 2),
  };
}

export function formatNumber(num: number, isCurrency = false): string {
  if (isCurrency) {
    if (num >= 1000000) {
      return `R$ ${(num / 1000000).toFixed(2).replace(".", ",")} Mi`;
    }
    if (num >= 1000) {
      return `R$ ${(num / 1000).toFixed(0).replace(".", ",")} Mil`;
    }
    return `R$ ${num.toLocaleString("pt-BR")}`;
  }
  return num.toLocaleString("pt-BR");
}

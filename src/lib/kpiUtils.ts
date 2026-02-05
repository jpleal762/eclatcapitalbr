import { KPIRecord, ProcessedKPI, DashboardData, GaugeKPI, AssessorPerformance, MetaSemanal, KPIStatusIcon } from "@/types/kpi";
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
// ICM = média ponderada dos gráficos 1, 2, 3, 4, 5, 8, 9
// Gráficos 1 (Captação NET), 2 (Receita) = peso 2
// Gráfico 5 (Parceiros Tri) = peso 1.5
// Gráficos 3 (Primeira reunião), 4 (Diversificada), 8 (Habilitação), 9 (Ativação) = peso 1
// Exclui gráficos 6 (PJ1 XP) e 7 (PJ2 XP)
// CRITICAL: Cap individual KPI percentages at 120% before weighted average
export const ICM_PERCENTAGE_CAP = 120;

export const KPI_WEIGHTS: Record<string, number> = {
  "Captação net": 2,           // Graph 1 - peso 2
  "Receita": 2,                // Graph 2 - peso 2
  "Primeira reuniao": 1,       // Graph 3 - peso 1
  "Diversificada ( ROA>1,5)": 1, // Graph 4 - peso 1
  "Parceiros Tri": 1.5,        // Graph 5 - peso 1.5
  "Habilitacao": 1,            // Graph 8 - peso 1
  "Ativacao": 1,               // Graph 9 - peso 1
};

// Mapeamento de label → peso para exibição nos gráficos
export const LABEL_TO_WEIGHT: Record<string, number> = {
  "Captação NET": 2,
  "Receita XP": 2,
  "Primeiras Reuniões": 1,
  "Diversificação": 1,
  "Receita Parceiros": 1.5,
  "Habilitação": 1,
  "Ativação": 1,
  // PJ1 XP e PJ2 XP não participam do ICM, sem peso
};

export function getWeightForLabel(label: string | undefined): number | undefined {
  if (!label) return undefined;
  return LABEL_TO_WEIGHT[label];
}

// ============= KPI CATEGORIES FOR GAUGES =============
// Note: Receita is special - target comes from PJ1 XP Mês + PJ2 XP Mês
export const KPI_CATEGORIES = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita XP", isCurrency: true, isSpecial: true, targetCategories: ["PJ1 XP Mês", "PJ2 XP Mês"], additionalActualCategory: "Receita Empilhada" },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  { category: "PJ1 XP Mês", label: "Receita PJ1 XP", isCurrency: true, isSpecial: true, actualCategory: "PJ1 XP" },
  { category: "PJ2 XP Mês", label: "Receita PJ2 XP", isCurrency: true, isSpecial: true, actualCategory: "PJ2 XP", additionalActualCategory: "Receita Empilhada" },
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
  
  // Helper to parse month string with either "/" or "-" separator
  const parseMonth = (m: string): { month: string; year: number } => {
    const separator = m.includes("/") ? "/" : "-";
    const parts = m.split(separator);
    const monthStr = parts[0]?.toLowerCase() || "";
    const yearStr = parts[1] || "0";
    return {
      month: monthStr,
      year: parseInt(yearStr) || 0
    };
  };
  
  const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  
  return Array.from(months).sort((a, b) => {
    const parsedA = parseMonth(a);
    const parsedB = parseMonth(b);
    
    // Sort by year first
    if (parsedA.year !== parsedB.year) {
      return parsedA.year - parsedB.year;
    }
    
    // Then sort by month order
    return monthOrder.indexOf(parsedA.month) - monthOrder.indexOf(parsedB.month);
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

export function isBrazilianHoliday(date: Date): boolean {
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

// Parse month string like "jan/25" to Date
function parseMonthString(monthStr: string): Date | null {
  if (!monthStr || monthStr === "all") return null;
  const parts = monthStr.toLowerCase().split("/");
  if (parts.length !== 2) return null;
  
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const monthIndex = monthNames.indexOf(parts[0]);
  if (monthIndex === -1) return null;
  
  let year = parseInt(parts[1]);
  if (year < 100) year += 2000; // Convert "25" to 2025
  
  return new Date(year, monthIndex, 1);
}

// Get total business days in a specific month
export function getTotalBusinessDaysInMonth(monthStr: string): number {
  const date = parseMonthString(monthStr);
  if (!date) {
    // Default to current month
    const now = new Date();
    return getTotalBusinessDaysInMonthDate(now);
  }
  return getTotalBusinessDaysInMonthDate(date);
}

function getTotalBusinessDaysInMonthDate(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  let businessDays = 0;
  let current = new Date(firstDay);
  
  while (current <= lastDay) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isBrazilianHoliday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

// Get remaining business days for a specific month
export function getWorkingDaysRemaining(monthStr: string): number {
  const targetDate = parseMonthString(monthStr);
  const now = new Date();
  
  if (!targetDate) {
    // Default: current month remaining days
    return getWorkingDaysRemainingFromDate(now);
  }
  
  // If selected month is in the past, return 0
  if (targetDate.getFullYear() < now.getFullYear() || 
      (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() < now.getMonth())) {
    return 0;
  }
  
  // If selected month is in the future, return total days in that month
  if (targetDate.getFullYear() > now.getFullYear() || 
      (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() > now.getMonth())) {
    return getTotalBusinessDaysInMonthDate(targetDate);
  }
  
  // Current month - calculate remaining from today
  return getWorkingDaysRemainingFromDate(now);
}

function getWorkingDaysRemainingFromDate(currentDate: Date): number {
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

// Get elapsed business days for a specific month
export function getElapsedBusinessDays(monthStr: string): number {
  const targetDate = parseMonthString(monthStr);
  const now = new Date();
  
  if (!targetDate) {
    return getElapsedBusinessDaysFromDate(now);
  }
  
  // If selected month is in the past, return total days (100% elapsed)
  if (targetDate.getFullYear() < now.getFullYear() || 
      (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() < now.getMonth())) {
    return getTotalBusinessDaysInMonthDate(targetDate);
  }
  
  // If selected month is in the future, return 0 (nothing elapsed)
  if (targetDate.getFullYear() > now.getFullYear() || 
      (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() > now.getMonth())) {
    return 0;
  }
  
  // Current month - calculate elapsed from start to today
  return getElapsedBusinessDaysFromDate(now);
}

function getElapsedBusinessDaysFromDate(currentDate: Date): number {
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

// Calculate ideal rhythm as percentage of elapsed business days
export function calculateIdealRhythm(monthStr: string): number {
  const totalDays = getTotalBusinessDaysInMonth(monthStr);
  const elapsed = getElapsedBusinessDays(monthStr);
  return totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 0;
}

// ============= KPI STATUS ICON DETERMINATION =============
/**
 * Determine which status icon to display for a KPI
 * 
 * @param realizadoPercentage - Achievement percentage (Realizado/Planejado Mes × 100)
 * @param ritmoIdeal - Ideal pace percentage based on elapsed business days
 * @returns Icon type to display
 * 
 * Rules (based on percentage of ritmoIdeal):
 * - TROPHY: > 120% of ritmoIdeal (exceptional performance)
 * - GREEN_CHECK: 100% - 120% of ritmoIdeal (on track or ahead)
 * - YELLOW_ALERT: 51% - 99% of ritmoIdeal (below pace but acceptable)
 * - ORANGE_ALERT: 26% - 50% of ritmoIdeal (concerning performance)
 * - RED_ALERT: ≤ 25% of ritmoIdeal (critical - needs attention)
 */
export function getKPIStatusIcon(
  realizadoPercentage: number,
  ritmoIdeal: number
): KPIStatusIcon {
  // Calculate percentage relative to ideal rhythm
  const percentageOfIdeal = ritmoIdeal > 0 ? (realizadoPercentage / ritmoIdeal) * 100 : 0;
  
  // Priority 1: Trophy - Above 120% of ideal rhythm
  if (percentageOfIdeal > 120) {
    return "TROPHY";
  }
  
  // Priority 2: Green Clock - Between 100% and 120% of ideal rhythm
  if (percentageOfIdeal >= 100) {
    return "GREEN_CHECK";
  }
  
  // Priority 3: Yellow Alert - Between 51% and 99% of ideal rhythm
  if (percentageOfIdeal > 50) {
    return "YELLOW_ALERT";
  }
  
  // Priority 4: Orange Alert - Between 26% and 50% of ideal rhythm
  if (percentageOfIdeal > 25) {
    return "ORANGE_ALERT";
  }
  
  // Priority 5: Red Alert - Up to 25% of ideal rhythm
  return "RED_ALERT";
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

function isAgendadaStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("agendada") || s === "agendada";
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
// CRITICAL: Cap individual KPI percentages at 120% before weighted average
export function calculateICMGeral(
  data: ProcessedKPI[], 
  month: string
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    let target = month !== "all" ? getMonthValue(plannedData, month) : plannedData.reduce((s, d) => s + d.total, 0);
    let actual = month !== "all" ? getMonthValue(realizedData, month) : realizedData.reduce((s, d) => s + d.total, 0);

    // Verificar se há additionalActualCategory para esta categoria (ex: Receita Empilhada)
    const kpiConfig = KPI_CATEGORIES.find(k => k.category === category);
    if (kpiConfig?.additionalActualCategory) {
      const additionalData = filterByCategory(data, kpiConfig.additionalActualCategory);
      const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
      actual += month !== "all" 
        ? getMonthValue(additionalRealizedData, month) 
        : additionalRealizedData.reduce((s, d) => s + d.total, 0);
    }

    if (target > 0) {
      const rawAchievementPct = (actual / target) * 100;
      // ⚠️ CRITICAL: Cap at 120% before adding to weighted sum
      const cappedPct = Math.min(rawAchievementPct, ICM_PERCENTAGE_CAP);
      weightedSum += cappedPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ============= HISTORICAL ICM DATA =============

/**
 * Get the current month in the format used by the data (e.g., "jan-26")
 */
export function getCurrentMonthFormatted(): string {
  const now = new Date();
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${monthNames[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
}

/**
 * Get the previous N months from the CURRENT month (not selected month)
 * @param availableMonths - Array of available months in the data
 * @param count - Number of previous months to get (default: 2)
 * @returns Array of previous month strings in chronological order, plus current month
 */
export function getHistoricalMonthsFromCurrent(
  availableMonths: string[], 
  count: number = 2
): string[] {
  if (availableMonths.length === 0) return [];
  
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-11
  const currentYear = now.getFullYear() % 100; // 26 para 2026
  
  const normalizeMonth = (m: string) => m.toLowerCase().replace("-", "/");
  
  // Calculate the previous N months based on calendar (not array index)
  const calendarMonths: string[] = [];
  for (let i = count; i >= 0; i--) {
    let targetMonthIdx = currentMonthIdx - i;
    let targetYear = currentYear;
    
    // Handle year rollback (e.g., January - 2 = November of previous year)
    while (targetMonthIdx < 0) {
      targetMonthIdx += 12;
      targetYear -= 1;
    }
    
    const monthStr = `${monthNames[targetMonthIdx]}-${targetYear.toString().padStart(2, '0')}`;
    calendarMonths.push(monthStr);
  }
  
  // Find matching months in availableMonths (case-insensitive, separator-agnostic)
  const result: string[] = [];
  for (const calMonth of calendarMonths) {
    const normalizedCal = normalizeMonth(calMonth);
    const found = availableMonths.find(m => normalizeMonth(m) === normalizedCal);
    if (found) {
      result.push(found);
    }
  }
  
  return result;
}

export interface HistoricalICMData {
  month: string;
  icmGeral: number;
  isCurrent?: boolean;
}

/**
 * Calculate historical ICM data for a specific assessor based on CURRENT month
 */
export function getAssessorHistoricalICMFromCurrent(
  data: ProcessedKPI[],
  assessor: string,
  availableMonths: string[],
  count: number = 2
): HistoricalICMData[] {
  if (assessor === "all" || !assessor) return [];
  
  const historicalMonths = getHistoricalMonthsFromCurrent(availableMonths, count);
  if (historicalMonths.length === 0) return [];
  
  const assessorData = filterByAssessor(data, assessor);
  
  return historicalMonths.map((month, idx) => ({
    month: month.toUpperCase().split("/")[0].split("-")[0],
    icmGeral: calculateICMGeral(assessorData, month),
    isCurrent: idx === historicalMonths.length - 1
  }));
}

/**
 * Get the previous N months from the selected month (legacy function)
 * @param selectedMonth - Current selected month (e.g., "jan-26")
 * @param availableMonths - Array of available months in the data
 * @param count - Number of previous months to get (default: 2)
 * @returns Array of previous month strings in chronological order
 */
export function getPreviousMonths(
  selectedMonth: string, 
  availableMonths: string[], 
  count: number = 2
): string[] {
  if (!selectedMonth || selectedMonth === "all" || availableMonths.length === 0) {
    return [];
  }
  
  // Normalize the selected month for comparison
  const normalizeMonth = (m: string) => m.toLowerCase().replace("-", "/");
  const normalizedSelected = normalizeMonth(selectedMonth);
  
  const currentIndex = availableMonths.findIndex(m => 
    normalizeMonth(m) === normalizedSelected
  );
  
  if (currentIndex === -1) return [];
  // Get previous months (as many as available, up to count)
  const previousMonths: string[] = [];
  for (let i = 1; i <= count && currentIndex - i >= 0; i++) {
    previousMonths.unshift(availableMonths[currentIndex - i]);
  }
  
  return previousMonths;
}

/**
 * Historical ICM data for a specific assessor
 */
export interface HistoricalICMData {
  month: string;
  icmGeral: number;
}

/**
 * Calculate historical ICM data for a specific assessor
 */
export function getAssessorHistoricalICM(
  data: ProcessedKPI[],
  assessor: string,
  selectedMonth: string,
  previousMonths: string[]
): HistoricalICMData[] {
  if (assessor === "all" || !assessor) return [];
  
  const assessorData = filterByAssessor(data, assessor);
  const allMonths = [...previousMonths, selectedMonth];
  
  return allMonths.map(month => ({
    // Extract month abbreviation: "jan/26" -> "JAN", "jan-26" -> "JAN"
    month: month.toUpperCase().split("/")[0].split("-")[0],
    icmGeral: calculateICMGeral(assessorData, month)
  }));
}

// CRITICAL: Cap individual KPI percentages at 120% before weighted average
// Calculate ICM Semanal (Realizado vs Planejado Semana) with same weights as ICM Geral
export function calculateICMSemanal(data: ProcessedKPI[], month: string): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedWeekData = catData.filter(d => isPlannedWeekStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const targetWeek = month !== "all" 
      ? getMonthValue(plannedWeekData, month) 
      : plannedWeekData.reduce((s, d) => s + d.total, 0);
    let actual = month !== "all" 
      ? getMonthValue(realizedData, month) 
      : realizedData.reduce((s, d) => s + d.total, 0);

    // Verificar se há additionalActualCategory para esta categoria (ex: Receita Empilhada)
    const kpiConfig = KPI_CATEGORIES.find(k => k.category === category);
    if (kpiConfig?.additionalActualCategory) {
      const additionalData = filterByCategory(data, kpiConfig.additionalActualCategory);
      const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
      actual += month !== "all" 
        ? getMonthValue(additionalRealizedData, month) 
        : additionalRealizedData.reduce((s, d) => s + d.total, 0);
    }

    if (targetWeek > 0) {
      const rawAchievementPct = (actual / targetWeek) * 100;
      // ⚠️ CRITICAL: Cap at 120% before adding to weighted sum
      const cappedPct = Math.min(rawAchievementPct, ICM_PERCENTAGE_CAP);
      weightedSum += cappedPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// CRITICAL: Cap individual KPI percentages at 120% before weighted average
export function calculateICMRitmo(data: ProcessedKPI[], month: string): number {
  const totalBusinessDays = getTotalBusinessDaysInMonth(month);
  const elapsedBusinessDays = getElapsedBusinessDays(month);
  const paceRatio = totalBusinessDays > 0 ? elapsedBusinessDays / totalBusinessDays : 0;

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    const target = month !== "all" ? getMonthValue(plannedData, month) : plannedData.reduce((s, d) => s + d.total, 0);
    let actual = month !== "all" ? getMonthValue(realizedData, month) : realizedData.reduce((s, d) => s + d.total, 0);
    
    // Verificar se há additionalActualCategory para esta categoria (ex: Receita Empilhada)
    const kpiConfig = KPI_CATEGORIES.find(k => k.category === category);
    if (kpiConfig?.additionalActualCategory) {
      const additionalData = filterByCategory(data, kpiConfig.additionalActualCategory);
      const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
      actual += month !== "all" 
        ? getMonthValue(additionalRealizedData, month) 
        : additionalRealizedData.reduce((s, d) => s + d.total, 0);
    }

    const expectedAtPace = target * paceRatio;

    if (expectedAtPace > 0) {
      const rawPaceAchievementPct = (actual / expectedAtPace) * 100;
      // ⚠️ CRITICAL: Cap at 120% before adding to weighted sum
      const cappedPct = Math.min(rawPaceAchievementPct, ICM_PERCENTAGE_CAP);
      weightedSum += cappedPct * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ============= RECEITA EMPILHADA POR ASSESSOR =============
export interface AssessorReceitaEmpilhadaData {
  name: string;
  value: number;
}

/**
 * Calculate the "Receita Empilhada" for each assessor
 * @param data - Processed KPI data
 * @param month - Selected month (e.g., "jan/25")
 * @returns Array of assessor data sorted by value (highest first)
 */
export function calculateAssessorReceitaEmpilhada(
  data: ProcessedKPI[],
  month: string
): AssessorReceitaEmpilhadaData[] {
  if (!data || data.length === 0 || month === "all") {
    return [];
  }

  // Get all unique assessors
  const allAssessors = [...new Set(data.map(d => d.assessor))].filter(Boolean);

  const results = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    
    // Filter for "Receita Empilhada" category with "Realizado" status
    const receitaEmpilhadaData = filterByCategory(assessorData, "Receita Empilhada");
    const realizedData = receitaEmpilhadaData.filter(d => isRealizedStatus(d.status));
    const value = getMonthValue(realizedData, month);

    return {
      name: assessor.split(" ")[0], // Get first name only
      value
    };
  });

  // Filter out zero values and sort by value (highest first)
  return results
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// ============= ACCUMULATED GAPS CALCULATION =============
/**
 * Calculate accumulated gaps from previous months in the same year
 * Gap = max(0, Planejado Mês - Realizado) for each month
 * @param data - Processed KPI data
 * @param currentMonth - Selected month (e.g., "jan/26")
 * @param assessor - Selected assessor or "all"
 * @returns Map of category -> accumulated gap value
 */
export function calculateAccumulatedGaps(
  data: ProcessedKPI[],
  currentMonth: string,
  assessor: string
): Map<string, number> {
  const gaps = new Map<string, number>();
  
  console.log("=== calculateAccumulatedGaps DEBUG ===");
  console.log("currentMonth:", currentMonth);
  console.log("assessor:", assessor);
  console.log("data length:", data?.length);
  
  if (!data || data.length === 0 || currentMonth === "all") {
    console.log("Early return: no data or 'all' month");
    return gaps;
  }

  // Parse current month to extract year and month index
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  
  // Mapeamento inglês → português para suportar ambos os formatos
  const englishToPortuguese: { [key: string]: string } = {
    "jan": "jan", "feb": "fev", "mar": "mar", "apr": "abr",
    "may": "mai", "jun": "jun", "jul": "jul", "aug": "ago",
    "sep": "set", "oct": "out", "nov": "nov", "dec": "dez"
  };
  
  const separator = currentMonth.includes("/") ? "/" : "-";
  let [monthStr, yearStr] = currentMonth.toLowerCase().split(separator);
  
  // Converter inglês para português se necessário
  monthStr = englishToPortuguese[monthStr] || monthStr;
  
  const currentMonthIndex = monthNames.indexOf(monthStr);
  const currentYear = parseInt(yearStr) + (parseInt(yearStr) < 100 ? 2000 : 0);
  
  console.log("Parsed:", { monthStr, yearStr, currentMonthIndex, currentYear });
  
  if (currentMonthIndex <= 0) {
    // January or invalid - no previous months in the year
    console.log("Early return: January or invalid month index");
    return gaps;
  }

  // Get all available months from data
  const availableMonths = getAvailableMonths(data);
  console.log("Available months:", availableMonths);

  // Filter to previous months in the same year
  const previousMonths = availableMonths.filter(m => {
    const sep = m.includes("/") ? "/" : "-";
    let [mStr, yStr] = m.toLowerCase().split(sep);
    
    // Converter inglês para português se necessário
    mStr = englishToPortuguese[mStr] || mStr;
    
    const mIndex = monthNames.indexOf(mStr);
    const mYear = parseInt(yStr) + (parseInt(yStr) < 100 ? 2000 : 0);
    
    // Ignorar meses não reconhecidos (índice -1)
    if (mIndex === -1) return false;
    
    return mYear === currentYear && mIndex < currentMonthIndex;
  });

  console.log("Previous months in same year:", previousMonths);

  if (previousMonths.length === 0) {
    console.log("Early return: no previous months found");
    return gaps;
  }

  // Filter data by assessor
  const filteredData = filterByAssessor(data, assessor);

  // Categories to calculate gaps for (aligned with KPI_CATEGORIES)
  const gapCategories = [
    { category: "Captação net", targetCategories: undefined },
    { category: "Receita", targetCategories: ["PJ1 XP Mês", "PJ2 XP Mês"], additionalActualCategory: "Receita Empilhada" },
    { category: "Primeira reuniao", targetCategories: undefined },
    { category: "Diversificada ( ROA>1,5)", targetCategories: undefined },
    { category: "Parceiros Tri", targetCategories: undefined },
    { category: "PJ1 XP Mês", targetCategories: undefined, actualCategory: "PJ1 XP" },
    { category: "PJ2 XP Mês", targetCategories: undefined, actualCategory: "PJ2 XP", additionalActualCategory: "Receita Empilhada" },
    { category: "Habilitacao", targetCategories: undefined },
    { category: "Ativacao", targetCategories: undefined },
  ];

  // For each category, calculate accumulated gap
  for (const gapConfig of gapCategories) {
    let totalGap = 0;

    for (const prevMonth of previousMonths) {
      let target = 0;
      let actual = 0;

      if (gapConfig.targetCategories && gapConfig.targetCategories.length > 0) {
        // Target from multiple categories (Receita case)
        target = gapConfig.targetCategories.reduce((sum, cat) => {
          const catData = filterByCategory(filteredData, cat);
          const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
          return sum + getMonthValue(plannedData, prevMonth);
        }, 0);
      } else {
        // Target from same category
        const catData = filterByCategory(filteredData, gapConfig.category);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        target = getMonthValue(plannedData, prevMonth);
      }

      // Actual value
      const actualCat = (gapConfig as any).actualCategory || gapConfig.category;
      const catData = filterByCategory(filteredData, actualCat);
      const realizedData = catData.filter(d => isRealizedStatus(d.status));
      actual = getMonthValue(realizedData, prevMonth);

      // Add additional category if present
      if ((gapConfig as any).additionalActualCategory) {
        const additionalData = filterByCategory(filteredData, (gapConfig as any).additionalActualCategory);
        const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
        actual += getMonthValue(additionalRealizedData, prevMonth);
      }

      // Gap = max(0, target - actual)
      totalGap += Math.max(0, target - actual);
    }

    if (totalGap > 0) {
      gaps.set(gapConfig.category, totalGap);
      console.log(`Gap calculado para ${gapConfig.category}: ${totalGap}`);
    }
  }

  console.log("=== GAPS FINAIS ===");
  console.log("Gaps calculados:", Object.fromEntries(gaps));
  console.log("=====================================");
  
  return gaps;
}

// ============= ASSESSOR REMAINING CALCULATION =============
export interface AssessorRemainingData {
  name: string;
  remaining: number;
  achieved: boolean;
}

/**
 * Calculate how much each assessor is missing to hit their individual target for a specific KPI
 * @param data - Processed KPI data
 * @param category - The KPI category (e.g., "Captação net", "Receita")
 * @param month - Selected month (e.g., "jan/25")
 * @param targetCategories - Optional array of categories for target calculation (used for Receita)
 * @param actualCategory - Optional category to use for actual values (used for PJ1 XP, PJ2 XP)
 * @returns Array of assessor data sorted by remaining (highest first)
 */
export function calculateAssessorRemainingForKPI(
  data: ProcessedKPI[],
  category: string,
  month: string,
  targetCategories?: string[],
  actualCategory?: string,
  additionalActualCategory?: string
): AssessorRemainingData[] {
  if (!data || data.length === 0 || month === "all") {
    return [];
  }

  // Get all unique assessors
  const allAssessors = [...new Set(data.map(d => d.assessor))].filter(Boolean);

  const results = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);

    // Calculate target
    let target: number;
    if (targetCategories && targetCategories.length > 0) {
      // Special case: target comes from sum of multiple categories (e.g., Receita uses PJ1 XP Mês + PJ2 XP Mês)
      target = targetCategories.reduce((sum, cat) => {
        const catData = filterByCategory(assessorData, cat);
        const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
        return sum + getMonthValue(plannedData, month);
      }, 0);
    } else {
      // Normal case: target from same category
      const catData = filterByCategory(assessorData, category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      target = getMonthValue(plannedData, month);
    }

    // Calculate actual/realized value
    const actualCat = actualCategory || category;
    const catData = filterByCategory(assessorData, actualCat);
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    let value = getMonthValue(realizedData, month);

    // Add additional category value (e.g., Receita Empilhada for Receita XP)
    if (additionalActualCategory) {
      const additionalData = filterByCategory(assessorData, additionalActualCategory);
      const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
      value += getMonthValue(additionalRealizedData, month);
    }

    const remaining = Math.max(target - value, 0);
    const achieved = target > 0 && value >= target;

    return {
      name: assessor.split(" ")[0], // Get first name only
      remaining,
      achieved
    };
  });

  // Sort: achieved at bottom, then by remaining (highest first)
  return results.sort((a, b) => {
    if (a.achieved && !b.achieved) return 1;
    if (!a.achieved && b.achieved) return -1;
    return b.remaining - a.remaining;
  });
}



export function processDashboardData(
  data: ProcessedKPI[], 
  selectedMonth: string, 
  selectedAssessor: string = "all"
): DashboardData {
  const filteredByAssessor = filterByAssessor(data, selectedAssessor);
  
  const icmGeral = calculateICMGeral(filteredByAssessor, selectedMonth);
  // Ritmo Ideal = percentage of elapsed business days in the selected month
  const ritmoIdeal = calculateIdealRhythm(selectedMonth);
  const diasUteisRestantes = getWorkingDaysRemaining(selectedMonth);
  const totalDiasUteis = getTotalBusinessDaysInMonth(selectedMonth);
  const diasUteisDecorridos = getElapsedBusinessDays(selectedMonth);

  // Meta Semanal - Categorias específicas com Planejado Semana na nova ordem
  // Ordem: Captação NET → Receita → Diversificação → Primeiras Reuniões → Habilitação → Ativação
  const metaSemanalCategories = [
    { category: "Captação net", label: "Captação NET", isCurrency: true },
    // Receita PJ1 XP: Meta = PJ1 XP Mês (Planejado Semana), Realizado = PJ1 XP (Realizado)
    { category: "PJ1 XP Mês", label: "Receita PJ1 XP", isCurrency: true, actualCategory: "PJ1 XP" },
    // Receita PJ2 XP: Meta = PJ2 XP Mês (Planejado Semana), Realizado = PJ2 XP + Receita Empilhada (Realizado)
    { category: "PJ2 XP Mês", label: "Receita PJ2 XP", isCurrency: true, actualCategory: "PJ2 XP", additionalActualCategory: "Receita Empilhada" },
    { category: "Diversificada ( ROA>1,5)", label: "Diversificação (ROA>1,5)", isCurrency: true },
    { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
    { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
    { category: "Habilitacao", label: "Habilitação", isCurrency: false },
    { category: "Ativacao", label: "Ativação", isCurrency: false },
  ];
  
  const metaSemanal: MetaSemanal[] = metaSemanalCategories.map(item => {
    const catData = filterByCategory(filteredByAssessor, item.category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    
    const value = selectedMonth !== "all" 
      ? getMonthValue(weeklyPlanned, selectedMonth)
      : weeklyPlanned.reduce((s, d) => s + d.total, 0);
    
    // Determinar categoria para valor realizado (pode ser diferente da meta)
    const actualCat = (item as any).actualCategory || item.category;
    const actualCatData = filterByCategory(filteredByAssessor, actualCat);
    const realizedData = actualCatData.filter(d => isRealizedStatus(d.status));
    
    let realizedValue = selectedMonth !== "all"
      ? getMonthValue(realizedData, selectedMonth)
      : realizedData.reduce((s, d) => s + d.total, 0);
    
    // Adicionar categoria adicional se definida (ex: Receita Empilhada para PJ2 XP)
    if ((item as any).additionalActualCategory) {
      const additionalData = filterByCategory(filteredByAssessor, (item as any).additionalActualCategory);
      const additionalRealized = additionalData.filter(d => isRealizedStatus(d.status));
      realizedValue += selectedMonth !== "all"
        ? getMonthValue(additionalRealized, selectedMonth)
        : additionalRealized.reduce((s, d) => s + d.total, 0);
    }
      
    return { label: item.label, value, realizedValue, isCurrency: item.isCurrency };
  });

  // Calculate metaSemanalPercentage: sum of Planejado Semana (6 KPIs) / sum of Planejado Mês (8 KPIs)
  // Weekly categories (6): Habilitacao, Ativacao, Captacao net, Diversificada ( ROA>1,5), Receita, Primeira Reuniao
  const weeklyCategories = [
    "Habilitacao",
    "Ativacao",
    "Captacao net",
    "Diversificada ( ROA>1,5)",
    "PJ1 XP Mês",  // Substituído de "Receita"
    "PJ2 XP Mês",  // Adicionado
    "Parceiros Tri",
    "Primeira Reuniao"
  ];

  const sumPlannedWeek = weeklyCategories.reduce((sum, category) => {
    const catData = filterByCategory(filteredByAssessor, category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const value = selectedMonth !== "all" 
      ? getMonthValue(weeklyPlanned, selectedMonth)
      : weeklyPlanned.reduce((s, d) => s + d.total, 0);
    return sum + value;
  }, 0);

  // Monthly categories (8): Same 6 + PJ1 XP Mes, PJ2 XP Mes, Parceiros Tri
  const monthlyCategories = [
    "Habilitacao",
    "Ativacao",
    "Captacao net",
    "Diversificada ( ROA>1,5)",
    "PJ1 XP Mes",
    "PJ2 XP Mes",
    "Parceiros Tri",
    "Primeira Reuniao"
  ];

  const sumPlannedMonth = monthlyCategories.reduce((sum, category) => {
    const catData = filterByCategory(filteredByAssessor, category);
    const monthlyPlanned = catData.filter(d => isPlannedMonthStatus(d.status));
    const value = selectedMonth !== "all" 
      ? getMonthValue(monthlyPlanned, selectedMonth)
      : monthlyPlanned.reduce((s, d) => s + d.total, 0);
    return sum + value;
  }, 0);

  const metaSemanalPercentage = sumPlannedMonth > 0 
    ? Math.round((sumPlannedWeek / sumPlannedMonth) * 100) 
    : 0;

  // Assessor Performance - Always show all assessors (ignores filter)
  const allAssessors = [...new Set(data.map(d => d.assessor))];
  const assessorPerformance: AssessorPerformance[] = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    const icm = calculateICMGeral(assessorData, selectedMonth);
    const icmSemanal = calculateICMSemanal(assessorData, selectedMonth);
    return {
      name: assessor.split(" ").slice(0, 2).join(" "),
      fullName: assessor,
      geralPercentage: icm,
      semanaPercentage: icmSemanal,
    };
  }).sort((a, b) => b.geralPercentage - a.geralPercentage);

  // Gauge KPIs
  const gaugeKPIs: GaugeKPI[] = KPI_CATEGORIES.map(kpi => {
    let target: number = 0;
    let value: number = 0;
    let additionalValueForGauge = 0;

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
        
      // If there's an additional category (e.g., Receita Empilhada), add it to the realized value
      if ((kpi as any).additionalActualCategory) {
        const additionalCategory = (kpi as any).additionalActualCategory as string;
        const additionalData = filterByCategory(filteredByAssessor, additionalCategory);
        const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
        additionalValueForGauge = selectedMonth !== "all"
          ? getMonthValue(additionalRealizedData, selectedMonth)
          : additionalRealizedData.reduce((s, d) => s + d.total, 0);
        value += additionalValueForGauge;
      }
    }
    // Special case for PJ1/PJ2: target from "PJ1 XP Mês"/"PJ2 XP Mês", actual from "PJ1 XP"/"PJ2 XP"
    // Also tracks additionalValue separately for segmented bar visualization
    else if ((kpi as any).isSpecial && (kpi as any).actualCategory) {
      const actualCategory = (kpi as any).actualCategory as string;
      
      // Target comes from category (e.g., "PJ1 XP Mês") with Planejado Mês
      const catData = filterByCategory(filteredByAssessor, kpi.category);
      const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
      target = selectedMonth !== "all" 
        ? getMonthValue(plannedData, selectedMonth)
        : plannedData.reduce((s, d) => s + d.total, 0);
      
      // Actual comes from actualCategory (e.g., "PJ1 XP") with Realizado
      const actualData = filterByCategory(filteredByAssessor, actualCategory);
      const realizedData = actualData.filter(d => isRealizedStatus(d.status));
      value = selectedMonth !== "all"
        ? getMonthValue(realizedData, selectedMonth)
        : realizedData.reduce((s, d) => s + d.total, 0);
      
      // If there's an additional category (e.g., Receita Empilhada), add it to the realized value
      // AND save separately for segmented bar visualization
      if ((kpi as any).additionalActualCategory) {
        const additionalCategory = (kpi as any).additionalActualCategory as string;
        const additionalData = filterByCategory(filteredByAssessor, additionalCategory);
        const additionalRealizedData = additionalData.filter(d => isRealizedStatus(d.status));
        additionalValueForGauge = selectedMonth !== "all"
          ? getMonthValue(additionalRealizedData, selectedMonth)
          : additionalRealizedData.reduce((s, d) => s + d.total, 0);
        value += additionalValueForGauge;
      }
    }
    else {
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
    const statusIcon = getKPIStatusIcon(percentage, ritmoIdeal);

    // Base KPI object
    const baseKPI: GaugeKPI = {
      label: kpi.label,
      value,
      target: target || 0,
      percentage,
      isCurrency: kpi.isCurrency,
      warning: percentage < 50,
      statusIcon,
      // Include additionalValue for segmented bar visualization (e.g., PJ2 XP with Receita Empilhada)
      additionalValue: additionalValueForGauge > 0 ? additionalValueForGauge : undefined,
    };

    // Special case for "Primeira reuniao": add secondary bar with "Agendadas" data
    if (kpi.category === "Primeira reuniao") {
      const primeiraReuniaoData = filterByCategory(filteredByAssessor, "Primeira reuniao");
      const agendadaData = primeiraReuniaoData.filter(d => isAgendadaStatus(d.status));
      const agendadaValue = selectedMonth !== "all"
        ? getMonthValue(agendadaData, selectedMonth)
        : agendadaData.reduce((s, d) => s + d.total, 0);
      
      const agendadaPercentage = target > 0 ? Math.round((agendadaValue / target) * 100) : 0;

      return {
        ...baseKPI,
        secondaryValue: agendadaValue,
        secondaryPercentage: agendadaPercentage,
        secondaryLabel: "Agendadas",
      };
    }

    return baseKPI;
  });

  return {
    icmGeral,
    ritmoIdeal,
    diasUteisRestantes,
    totalDiasUteis,
    diasUteisDecorridos,
    metaSemanalReal: icmGeral,
    metaSemanal,
    metaSemanalPercentage,
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

// ============= ASSESSOR AGENDADAS CALCULATION =============
export interface AssessorAgendadasData {
  name: string;
  value: number;
}

export function calculateAssessorAgendadasForKPI(
  data: ProcessedKPI[],
  month: string
): AssessorAgendadasData[] {
  if (!data || data.length === 0 || month === "all") return [];

  const allAssessors = [...new Set(data.map(d => d.assessor))].filter(Boolean);

  const results = allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    const primeiraReuniaoData = filterByCategory(assessorData, "Primeira reuniao");
    const agendadaData = primeiraReuniaoData.filter(d => isAgendadaStatus(d.status));
    const value = getMonthValue(agendadaData, month);

    return {
      name: assessor.split(" ")[0],
      value
    };
  });

  return results
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// ============= SPRINT DATA CALCULATION =============
import { AssessorWeeklyRemaining, SprintKPIData } from "@/types/kpi";

/**
 * Calculate weekly remaining for each assessor for a specific KPI
 */
export function calculateWeeklyRemainingByAssessor(
  data: ProcessedKPI[],
  category: string,
  month: string,
  includeEmpilhada: boolean = false
): AssessorWeeklyRemaining[] {
  if (!data || data.length === 0 || month === "all") return [];

  const allAssessors = [...new Set(data.map(d => d.assessor))]
    .filter(a => a && a !== "Socios");

  return allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    
    // Meta semanal individual
    const catData = filterByCategory(assessorData, category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const target = getMonthValue(weeklyPlanned, month);
    
    // Realizado individual
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    let value = getMonthValue(realizedData, month);
    
    // Adicionar Receita Empilhada se aplicável
    if (includeEmpilhada) {
      const empilhadaData = filterByCategory(assessorData, "Receita Empilhada");
      const empilhadaRealized = empilhadaData.filter(d => isRealizedStatus(d.status));
      value += getMonthValue(empilhadaRealized, month);
    }
    
    const remaining = Math.max(target - value, 0);
    
    return {
      name: assessor.split(" ")[0],
      remaining,
      achieved: target > 0 && value >= target,
      contribution: value
    };
  })
  .sort((a, b) => {
    // Quem não bateu primeiro, ordenado por maior falta
    if (a.achieved && !b.achieved) return 1;
    if (!a.achieved && b.achieved) return -1;
    return b.remaining - a.remaining;
  });
}

/**
 * Calculate sprint data for all KPIs
 */
export function calculateSprintData(
  data: ProcessedKPI[],
  selectedMonth: string,
  selectedAssessor: string
): SprintKPIData[] {
  const categories = [
    { category: "Captação net", label: "Captação NET", isCurrency: true, includeEmpilhada: false },
    { category: "Receita", label: "Receita", isCurrency: true, includeEmpilhada: true },
    { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true, includeEmpilhada: false },
    { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true, includeEmpilhada: false },
    { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false, includeEmpilhada: false },
    { category: "Habilitacao", label: "Habilitação", isCurrency: false, includeEmpilhada: false },
    { category: "Ativacao", label: "Ativação", isCurrency: false, includeEmpilhada: false },
  ];
  
  return categories.map(item => {
    // Filtrar por assessor se selecionado
    const filteredData = selectedAssessor === "all" 
      ? data 
      : filterByAssessor(data, selectedAssessor);
    
    // Calcular totais
    const catData = filterByCategory(filteredData, item.category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    
    const totalTarget = getMonthValue(weeklyPlanned, selectedMonth);
    let totalRealized = getMonthValue(realizedData, selectedMonth);
    
    if (item.includeEmpilhada) {
      const empilhadaData = filterByCategory(filteredData, "Receita Empilhada");
      const empilhadaRealized = empilhadaData.filter(d => isRealizedStatus(d.status));
      totalRealized += getMonthValue(empilhadaRealized, selectedMonth);
    }
    
    const totalRemaining = Math.max(totalTarget - totalRealized, 0);
    const progressPercentage = totalTarget > 0 
      ? Math.min((totalRealized / totalTarget) * 100, 100) 
      : 100;
    
    // Breakdown por assessor (apenas se "all" selecionado)
    const assessorBreakdown = selectedAssessor === "all"
      ? calculateWeeklyRemainingByAssessor(data, item.category, selectedMonth, item.includeEmpilhada)
      : [];
    
    return {
      label: item.label,
      category: item.category,
      totalRemaining,
      totalRealized,
      totalTarget,
      progressPercentage,
      isCurrency: item.isCurrency,
      isCompleted: totalRemaining === 0,
      assessorBreakdown
    };
  });
}

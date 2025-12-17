import { KPIRecord, ProcessedKPI, DashboardData, GaugeKPI, AssessorPerformance, MetaSemanal } from "@/types/kpi";
import * as XLSX from "xlsx";

export function parseXLSXFile(buffer: ArrayBuffer): KPIRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<KPIRecord>(worksheet);
  return data;
}

export function processKPIData(records: KPIRecord[]): ProcessedKPI[] {
  return records.map((record) => {
    const monthlyData: { month: string; value: number }[] = [];
    let total = 0;

    Object.entries(record).forEach(([key, value]) => {
      if (!["Assessor", "Categorias", "Status"].includes(key)) {
        const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
        if (numValue > 0) {
          monthlyData.push({ month: key, value: numValue });
          total += numValue;
        }
      }
    });

    return {
      assessor: record.Assessor,
      category: record.Categorias,
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

export function processDashboardData(data: ProcessedKPI[], selectedMonth: string): DashboardData {
  const filteredData = selectedMonth === "all" 
    ? data 
    : data.filter(d => d.monthlyData.some(m => m.month === selectedMonth));

  // Calculate ICM Geral (average performance)
  const plannedData = filteredData.filter(d => 
    d.status.toLowerCase().includes("planejado") || d.status.toLowerCase().includes("planned") || d.status.toLowerCase().includes("meta")
  );
  const realizedData = filteredData.filter(d => 
    d.status.toLowerCase().includes("realizado") || d.status.toLowerCase().includes("realized") || d.status.toLowerCase().includes("real")
  );

  const getMonthValue = (records: ProcessedKPI[], month: string) => {
    return records.reduce((sum, r) => {
      const monthData = r.monthlyData.find(m => m.month === month);
      return sum + (monthData?.value || 0);
    }, 0);
  };

  const totalPlanned = selectedMonth !== "all" 
    ? getMonthValue(plannedData, selectedMonth)
    : plannedData.reduce((sum, d) => sum + d.total, 0);
  
  const totalRealized = selectedMonth !== "all"
    ? getMonthValue(realizedData, selectedMonth)
    : realizedData.reduce((sum, d) => sum + d.total, 0);

  const icmGeral = totalPlanned > 0 ? Math.round((totalRealized / totalPlanned) * 100) : 0;
  const ritmoIdeal = calculateIdealRhythm();
  const diasUteisRestantes = getWorkingDaysRemaining();

  // Group by category for meta semanal
  const categories = [...new Set(filteredData.map(d => d.category))];
  const metaSemanal: MetaSemanal[] = categories.slice(0, 6).map(cat => {
    const catData = realizedData.filter(d => d.category === cat);
    const total = selectedMonth !== "all"
      ? getMonthValue(catData, selectedMonth)
      : catData.reduce((sum, d) => sum + d.total, 0);
    return { label: cat, value: total };
  });

  // Assessor performance
  const assessors = [...new Set(filteredData.map(d => d.assessor))];
  const assessorPerformance: AssessorPerformance[] = assessors.slice(0, 6).map(assessor => {
    const assessorPlanned = plannedData.filter(d => d.assessor === assessor);
    const assessorRealized = realizedData.filter(d => d.assessor === assessor);
    
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

  // Create gauge KPIs from categories
  const gaugeKPIs: GaugeKPI[] = categories.slice(0, 6).map(cat => {
    const catPlanned = plannedData.filter(d => d.category === cat);
    const catRealized = realizedData.filter(d => d.category === cat);
    
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

import { KPIRecord, ProcessedKPI, SummaryStats } from "@/types/kpi";

export function processKPIData(records: KPIRecord[]): ProcessedKPI[] {
  return records.map((record) => {
    const monthlyData: { month: string; value: number }[] = [];
    let total = 0;

    Object.entries(record).forEach(([key, value]) => {
      if (!["Assessor", "Categorias", "Status"].includes(key)) {
        const numValue = typeof value === "number" ? value : 0;
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

export function calculateSummary(data: ProcessedKPI[]): SummaryStats {
  const assessors = new Set(data.map((d) => d.assessor));
  const categories = new Set(data.map((d) => d.category));

  const plannedData = data.filter(
    (d) => d.status.toLowerCase().includes("planejado") || d.status.toLowerCase().includes("planned")
  );
  const realizedData = data.filter(
    (d) => d.status.toLowerCase().includes("realizado") || d.status.toLowerCase().includes("realized")
  );

  const totalPlanned = plannedData.reduce((sum, d) => sum + d.total, 0);
  const totalRealized = realizedData.reduce((sum, d) => sum + d.total, 0);
  const avgPerformance = totalPlanned > 0 ? (totalRealized / totalPlanned) * 100 : 0;

  return {
    totalAssessors: assessors.size,
    totalCategories: categories.size,
    totalPlanned,
    totalRealized,
    avgPerformance,
  };
}

export function aggregateMonthlyData(
  data: ProcessedKPI[]
): { month: string; planned: number; realized: number }[] {
  const monthMap = new Map<string, { planned: number; realized: number }>();

  data.forEach((record) => {
    const isPlanned =
      record.status.toLowerCase().includes("planejado") ||
      record.status.toLowerCase().includes("planned");
    const isRealized =
      record.status.toLowerCase().includes("realizado") ||
      record.status.toLowerCase().includes("realized");

    record.monthlyData.forEach(({ month, value }) => {
      const current = monthMap.get(month) || { planned: 0, realized: 0 };
      if (isPlanned) current.planned += value;
      if (isRealized) current.realized += value;
      monthMap.set(month, current);
    });
  });

  return Array.from(monthMap.entries())
    .map(([month, values]) => ({ month, ...values }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split("/");
      const [monthB, yearB] = b.month.split("/");
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
      return months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
    });
}

export function getAssessorPerformance(
  data: ProcessedKPI[]
): { name: string; planned: number; realized: number; performance: number }[] {
  const assessorMap = new Map<string, { planned: number; realized: number }>();

  data.forEach((record) => {
    const current = assessorMap.get(record.assessor) || { planned: 0, realized: 0 };
    const isPlanned =
      record.status.toLowerCase().includes("planejado") ||
      record.status.toLowerCase().includes("planned");
    const isRealized =
      record.status.toLowerCase().includes("realizado") ||
      record.status.toLowerCase().includes("realized");

    if (isPlanned) current.planned += record.total;
    if (isRealized) current.realized += record.total;
    assessorMap.set(record.assessor, current);
  });

  return Array.from(assessorMap.entries())
    .map(([name, values]) => ({
      name: name.split(" ").slice(0, 2).join(" "),
      ...values,
      performance: values.planned > 0 ? (values.realized / values.planned) * 100 : 0,
    }))
    .sort((a, b) => b.realized - a.realized);
}

export function getCategoryDistribution(
  data: ProcessedKPI[]
): { name: string; value: number; color: string }[] {
  const categoryMap = new Map<string, number>();

  data.forEach((record) => {
    const current = categoryMap.get(record.category) || 0;
    categoryMap.set(record.category, current + record.total);
  });

  const colors = [
    "hsl(174, 72%, 46%)",
    "hsl(199, 89%, 48%)",
    "hsl(142, 76%, 45%)",
    "hsl(38, 92%, 50%)",
    "hsl(280, 70%, 50%)",
    "hsl(340, 82%, 52%)",
  ];

  return Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value);
}

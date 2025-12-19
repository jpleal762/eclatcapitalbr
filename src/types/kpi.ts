export interface KPIRecord {
  Assessor: string;
  Categorias: string;
  Status: string;
  [key: string]: string | number;
}

export interface ProcessedKPI {
  assessor: string;
  category: string;
  status: string;
  monthlyData: { month: string; value: number }[];
  total: number;
}

export interface DashboardFilters {
  assessor: string;
  month: string;
}

export interface YearlyDashboardFilters {
  assessor: string;
  year: number;
}

export type DashboardView = "monthly" | "yearly";

export type KPIStatusIcon = "GREEN_CHECK" | "CLOCK" | "YELLOW_ALERT" | "RED_ALERT";

export interface GaugeKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  unit?: string;
  warning?: boolean;
  statusIcon?: KPIStatusIcon;
}

export interface AssessorPerformance {
  name: string;
  fullName?: string;
  geralPercentage: number;
  semanaPercentage: number;
}

export interface MetaSemanal {
  label: string;
  value: number | string;
  isCurrency?: boolean;
}

export interface DashboardData {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  metaSemanalReal: number;
  metaSemanal: MetaSemanal[];
  metaSemanalPercentage: number;
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
  headBruno: GaugeKPI[];
}

export interface YearlyDashboardData {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
}

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

export interface GaugeKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  unit?: string;
  warning?: boolean;
}

export interface AssessorPerformance {
  name: string;
  geralPercentage: number;
  semanaPercentage: number;
}

export interface MetaSemanal {
  label: string;
  value: number | string;
}

export interface DashboardData {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  metaSemanalReal: number;
  metaSemanal: MetaSemanal[];
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
  headBruno: GaugeKPI[];
}

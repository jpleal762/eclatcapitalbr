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



export type KPIStatusIcon = "GREEN_CHECK" | "CLOCK" | "YELLOW_ALERT" | "ORANGE_ALERT" | "RED_ALERT" | "TROPHY";

export interface GaugeKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  unit?: string;
  warning?: boolean;
  statusIcon?: KPIStatusIcon;
  // Secondary bar for additional indicators (e.g., "Agendadas" in Primeira reuniao)
  secondaryValue?: number;
  secondaryPercentage?: number;
  secondaryLabel?: string;
  // Additional value for segmented bar visualization (e.g., Receita Empilhada in PJ2 XP)
  additionalValue?: number;
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
  realizedValue?: number;
  isCurrency?: boolean;
}

export interface DashboardData {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  totalDiasUteis: number;
  diasUteisDecorridos: number;
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
  metaSemanal: MetaSemanal[];
  metaSemanalReal: number;
  metaSemanalPercentage: number;
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
}

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
  monthlyTarget?: number;
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

// ============= SPRINT PAGE TYPES =============
export interface AssessorWeeklyRemaining {
  name: string;           // Primeiro nome do assessor
  remaining: number;      // Quanto falta para bater a meta semanal individual
  achieved: boolean;      // Se já atingiu a meta
  contribution?: number;  // Quanto já contribuiu
}

export interface SprintKPIData {
  label: string;                          // "Captação NET", "Receita", etc.
  category: string;                       // Categoria interna
  totalRemaining: number;                 // Total que falta (objetivo da barra)
  totalRealized: number;                  // Total já realizado nesta semana
  totalTarget: number;                    // Meta semanal total
  progressPercentage: number;             // % do objetivo já produzido
  isCurrency: boolean;                    // Se é valor monetário
  isCompleted: boolean;                   // Se objetivo foi zerado
  assessorBreakdown: AssessorWeeklyRemaining[]; // Falta por assessor
}

// ============= SPRINT EVOLUTION TYPES =============
export interface SprintEvolution {
  difference: number;         // Diferença no valor realizado
  percentageChange: number;   // Variação percentual
  hoursAgo: number;           // Horas desde o snapshot anterior
}

export interface SprintEvolution48h {
  hoursAgo: number;
  totalProducedBefore: number;
  totalProducedNow: number;
  totalProducedDiff: number;
  kpisCompletedBefore: number;
  kpisCompletedNow: number;
  kpisCompletedDiff: number;
}

export interface SprintGlobalStats {
  totalObjective: number;         // Soma de todos totalRemaining (meta total)
  totalProduced: number;          // Soma de todos totalRealized
  totalStillMissing: number;      // totalObjective que ainda falta
  globalProgressPercentage: number;
  kpisCompleted: number;          // Quantos KPIs zerados
  kpisTotal: number;
}

// ============= SPRINT PRODUCT SELECTION =============
export interface SprintProductConfig {
  category: string;
  label: string;
  isCurrency: boolean;
}

// Lista de produtos disponíveis para Sprint
export const SPRINT_PRODUCTS: SprintProductConfig[] = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  { category: "Parceiros Tri", label: "Parceiros", isCurrency: true },
  { category: "Primeira reuniao", label: "Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];


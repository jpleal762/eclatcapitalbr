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
  category: string;
  status: string;
}

export interface SummaryStats {
  totalAssessors: number;
  totalCategories: number;
  totalPlanned: number;
  totalRealized: number;
  avgPerformance: number;
}

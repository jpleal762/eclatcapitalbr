import { useState, useMemo } from "react";
import { ProcessedKPI } from "@/types/kpi";
import { QUARTERS, processQuarterlyDashboardData, getCurrentQuarter, calculateQuarterlyIdealRhythm } from "@/lib/quarterlyKpiUtils";
import { QuarterlyKPIBar } from "./QuarterlyKPIBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, ArrowUpDown, ArrowUp, ArrowDown, Layers } from "lucide-react";

type ViewMode = "default" | "best-to-worst" | "worst-to-best" | "by-category";

const CATEGORY_GROUPS = {
  prospeccao: {
    label: "Prospecção",
    kpis: ["Primeiras Reuniões", "Habilitação", "Ativação"]
  },
  investimentos: {
    label: "Investimentos",
    kpis: ["Captação NET", "Diversificação"]
  },
  receita: {
    label: "Receita",
    kpis: ["Receita XP", "Receita PJ1 XP", "Receita PJ2 XP", "Receita Parceiros"]
  }
} as const;

interface AnalysisPageProps {
  processedData: ProcessedKPI[];
  assessors: string[];
  availableYears: number[];
  selectedAssessor: string;
  onAssessorChange: (assessor: string) => void;
}

export function AnalysisPage({ 
  processedData, 
  assessors, 
  availableYears,
  selectedAssessor,
  onAssessorChange 
}: AnalysisPageProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [viewMode, setViewMode] = useState<ViewMode>("default");

  const quarterlyKPIs = useMemo(
    () => processQuarterlyDashboardData(processedData, selectedYear, selectedQuarter, selectedAssessor),
    [processedData, selectedYear, selectedQuarter, selectedAssessor]
  );

  // Calculate ideal rhythm based on business days
  const ritmoIdeal = useMemo(
    () => calculateQuarterlyIdealRhythm(selectedYear, selectedQuarter),
    [selectedYear, selectedQuarter]
  );

  // Group KPIs by category for "by-category" view mode
  const kpisByCategory = useMemo(() => ({
    prospeccao: quarterlyKPIs.filter(kpi => 
      (CATEGORY_GROUPS.prospeccao.kpis as readonly string[]).includes(kpi.label)
    ),
    investimentos: quarterlyKPIs.filter(kpi => 
      (CATEGORY_GROUPS.investimentos.kpis as readonly string[]).includes(kpi.label)
    ),
    receita: quarterlyKPIs.filter(kpi => 
      (CATEGORY_GROUPS.receita.kpis as readonly string[]).includes(kpi.label)
    )
  }), [quarterlyKPIs]);

  // Sort KPIs based on selected order
  const sortedKPIs = useMemo(() => {
    if (viewMode === "default" || viewMode === "by-category") return quarterlyKPIs;
    
    return [...quarterlyKPIs].sort((a, b) => {
      if (viewMode === "best-to-worst") {
        return b.percentage - a.percentage;
      }
      return a.percentage - b.percentage; // worst-to-best
    });
  }, [quarterlyKPIs, viewMode]);

  // Check if we have any data
  const hasData = quarterlyKPIs.some(kpi => kpi.target > 0 || kpi.value > 0);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Filters Header */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Análise Trimestral</h2>
          </div>
          
          {/* Ritmo Ideal Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Ritmo Ideal: <span className="font-bold">{ritmoIdeal}%</span>
            </span>
          </div>
          
          <div className="flex-1" />
          
          {/* Assessor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Assessor:</span>
            <Select value={selectedAssessor} onValueChange={onAssessorChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODOS</SelectItem>
                {assessors.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ano:</span>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quarter Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trimestre:</span>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map((q) => (
                  <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Visualizar:</span>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
              <ToggleGroupItem value="default" aria-label="Ordem padrão" className="px-2 gap-1">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Padrão</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="best-to-worst" aria-label="Melhor para pior" className="px-2 gap-1">
                <ArrowUp className="h-4 w-4" />
                <span className="hidden sm:inline">Melhor</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="worst-to-best" aria-label="Pior para melhor" className="px-2 gap-1">
                <ArrowDown className="h-4 w-4" />
                <span className="hidden sm:inline">Pior</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="by-category" aria-label="Agrupar por categoria" className="px-2 gap-1">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Categoria</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {/* KPI Bars - Responsive layout without scroll on desktop/TV */}
      {hasData ? (
        viewMode === "by-category" ? (
          // Category grouped view - single column with section headers
          <div className="flex-1 min-h-0 flex flex-col gap-responsive-sm overflow-hidden lg:overflow-hidden overflow-y-auto">
            {/* Prospecção Section */}
            <div className="flex items-center gap-2 px-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.prospeccao.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategory.prospeccao.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} />
              </div>
            ))}

            {/* Investimentos Section */}
            <div className="flex items-center gap-2 px-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.investimentos.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategory.investimentos.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} />
              </div>
            ))}

            {/* Receita Section */}
            <div className="flex items-center gap-2 px-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.receita.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategory.receita.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} />
              </div>
            ))}
          </div>
        ) : (
          // Default/sorted view - stacked bars
          <div className="flex-1 min-h-0 flex flex-col gap-responsive-sm overflow-hidden lg:overflow-hidden overflow-y-auto">
            {sortedKPIs.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Sem dados para o período</h3>
            <p className="text-muted-foreground">
              Não há dados disponíveis para {QUARTERS.find(q => q.value === selectedQuarter)?.label} de {selectedYear}.
              Selecione outro período ou verifique se os dados foram carregados.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

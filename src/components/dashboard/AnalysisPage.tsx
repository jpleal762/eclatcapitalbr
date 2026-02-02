import { useState, useMemo } from "react";
import { ProcessedKPI } from "@/types/kpi";
import { QUARTERS, processQuarterlyDashboardData, getCurrentQuarter, calculateQuarterlyIdealRhythm, calculateAssessorGapsForKPI, calculateMonthlyGapsForBar, AssessorQuarterlyGap, MonthlyGapData } from "@/lib/quarterlyKpiUtils";
import { QuarterlyKPIBar } from "./QuarterlyKPIBar";
import { KPI_CATEGORIES } from "@/lib/kpiUtils";
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

// Mapeamento de KPIs para seus heads responsáveis
const KPI_HEADS: Record<string, string> = {
  "Receita PJ1 XP": "BRUNO",
};

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
  isAssessorLocked?: boolean;
}

export function AnalysisPage({ 
  processedData, 
  assessors, 
  availableYears,
  selectedAssessor,
  onAssessorChange,
  isAssessorLocked = false
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

  // Calculate top 2 gaps (KPIs with biggest deficit vs ritmo ideal)
  const top2Gaps = useMemo(() => {
    const withGap = quarterlyKPIs
      .filter(kpi => kpi.percentage < ritmoIdeal && kpi.target > 0)
      .map(kpi => ({ label: kpi.label, gap: ritmoIdeal - kpi.percentage }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 2)
      .map(g => g.label);
    return new Set(withGap);
  }, [quarterlyKPIs, ritmoIdeal]);

  // Calculate top 2 assessor gaps for each KPI AND monthly gaps for bar visualization
  const kpisWithAssessorGaps = useMemo(() => {
    return quarterlyKPIs.map(kpi => {
      // Find the KPI config to get category info
      const kpiConfig = KPI_CATEGORIES.find(k => k.label === kpi.label);
      
      // Calculate monthly gaps for the bar visualization
      let monthlyGaps: MonthlyGapData[] = [];
      if (kpiConfig) {
        monthlyGaps = calculateMonthlyGapsForBar(
          processedData,
          selectedYear,
          selectedQuarter,
          kpiConfig,
          kpi.percentage,
          selectedAssessor
        );
      }
      
      // Only calculate assessor gaps when filter is "all"
      if (selectedAssessor !== "all") {
        return { ...kpi, topAssessorGaps: [] as AssessorQuarterlyGap[], monthlyGaps };
      }
      
      if (!kpiConfig) {
        return { ...kpi, topAssessorGaps: [] as AssessorQuarterlyGap[], monthlyGaps };
      }
      
      const gaps = calculateAssessorGapsForKPI(
        processedData,
        selectedYear,
        selectedQuarter,
        kpiConfig,
        ritmoIdeal
      );
      
      return { ...kpi, topAssessorGaps: gaps, monthlyGaps };
    });
  }, [quarterlyKPIs, processedData, selectedYear, selectedQuarter, ritmoIdeal, selectedAssessor]);

  // Group KPIs by category for "by-category" view mode (using kpisWithAssessorGaps)
  const kpisByCategoryWithGaps = useMemo(() => ({
    prospeccao: kpisWithAssessorGaps.filter(kpi => 
      (CATEGORY_GROUPS.prospeccao.kpis as readonly string[]).includes(kpi.label)
    ),
    investimentos: kpisWithAssessorGaps.filter(kpi => 
      (CATEGORY_GROUPS.investimentos.kpis as readonly string[]).includes(kpi.label)
    ),
    receita: kpisWithAssessorGaps.filter(kpi => 
      (CATEGORY_GROUPS.receita.kpis as readonly string[]).includes(kpi.label)
    )
  }), [kpisWithAssessorGaps]);

  // Sort KPIs based on selected order (using kpisWithAssessorGaps)
  const sortedKPIs = useMemo(() => {
    if (viewMode === "default" || viewMode === "by-category") return kpisWithAssessorGaps;
    
    return [...kpisWithAssessorGaps].sort((a, b) => {
      if (viewMode === "best-to-worst") {
        return b.percentage - a.percentage;
      }
      return a.percentage - b.percentage; // worst-to-best
    });
  }, [kpisWithAssessorGaps, viewMode]);

  // Check if we have any data
  const hasData = quarterlyKPIs.some(kpi => kpi.target > 0 || kpi.value > 0);

  return (
    <div className="h-full flex flex-col gap-2 animate-fade-in">
      {/* Filters Header */}
      <Card className="p-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <BarChart3 className="size-scale-2.5 text-primary" />
            <h2 className="text-scale-9 font-bold text-foreground">Análise Trimestral</h2>
          </div>
          
          {/* Ritmo Ideal Indicator */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">
            <span className="text-scale-7 text-blue-600 dark:text-blue-400">
              Ritmo Ideal: <span className="font-bold">{ritmoIdeal}%</span>
            </span>
          </div>
          
          <div className="flex-1" />
          
          {/* Assessor Filter */}
          <div className="flex items-center gap-1">
            <span className="text-scale-7 text-muted-foreground">Assessor:</span>
            <Select value={selectedAssessor} onValueChange={onAssessorChange} disabled={isAssessorLocked}>
              <SelectTrigger className={`w-[80px] h-scale-4 text-scale-6 ${isAssessorLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
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
          <div className="flex items-center gap-1">
            <span className="text-scale-7 text-muted-foreground">Ano:</span>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[50px] h-scale-4 text-scale-6">
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
          <div className="flex items-center gap-1">
            <span className="text-scale-7 text-muted-foreground">Trimestre:</span>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[80px] h-scale-4 text-scale-6">
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
          <div className="flex items-center gap-1">
            <span className="text-scale-7 text-muted-foreground">Visualizar:</span>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
              <ToggleGroupItem value="default" aria-label="Ordem padrão" className="px-1 gap-0.5 h-scale-4">
                <ArrowUpDown className="size-scale-2" />
                <span className="hidden sm:inline text-scale-6">Padrão</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="best-to-worst" aria-label="Melhor para pior" className="px-1 gap-0.5 h-scale-4">
                <ArrowUp className="size-scale-2" />
                <span className="hidden sm:inline text-scale-6">Melhor</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="worst-to-best" aria-label="Pior para melhor" className="px-1 gap-0.5 h-scale-4">
                <ArrowDown className="size-scale-2" />
                <span className="hidden sm:inline text-scale-6">Pior</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="by-category" aria-label="Agrupar por categoria" className="px-1 gap-0.5 h-scale-4">
                <Layers className="size-scale-2" />
                <span className="hidden sm:inline text-scale-6">Categoria</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {/* KPI Bars - Responsive layout without scroll on desktop/TV */}
      {hasData ? (
        viewMode === "by-category" ? (
          // Category grouped view - single column with section headers
          <div className="flex-1 min-h-0 flex flex-col gap-[1px] lg:gap-0.5 overflow-hidden lg:overflow-hidden overflow-y-auto">
            {/* Prospecção Section */}
            <div className="flex items-center gap-0.5 px-0.5 shrink-0">
              <span className="size-scale-1 rounded-full bg-blue-500" />
              <span className="text-scale-5 font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.prospeccao.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategoryWithGaps.prospeccao.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} headName={KPI_HEADS[kpi.label]} isTopGap={top2Gaps.has(kpi.label)} monthlyGaps={kpi.monthlyGaps} />
              </div>
            ))}

            {/* Investimentos Section */}
            <div className="flex items-center gap-0.5 px-0.5 shrink-0">
              <span className="size-scale-1 rounded-full bg-amber-500" />
              <span className="text-scale-5 font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.investimentos.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategoryWithGaps.investimentos.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} headName={KPI_HEADS[kpi.label]} isTopGap={top2Gaps.has(kpi.label)} monthlyGaps={kpi.monthlyGaps} />
              </div>
            ))}

            {/* Receita Section */}
            <div className="flex items-center gap-0.5 px-0.5 shrink-0">
              <span className="size-scale-1 rounded-full bg-green-500" />
              <span className="text-scale-5 font-bold text-primary uppercase tracking-wide">
                {CATEGORY_GROUPS.receita.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {kpisByCategoryWithGaps.receita.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} headName={KPI_HEADS[kpi.label]} isTopGap={top2Gaps.has(kpi.label)} monthlyGaps={kpi.monthlyGaps} />
              </div>
            ))}
          </div>
        ) : (
          // Default/sorted view - stacked bars
          <div className="flex-1 min-h-0 flex flex-col gap-[1px] lg:gap-0.5 overflow-hidden lg:overflow-hidden overflow-y-auto">
            {sortedKPIs.map((kpi) => (
              <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
                <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} headName={KPI_HEADS[kpi.label]} isTopGap={top2Gaps.has(kpi.label)} monthlyGaps={kpi.monthlyGaps} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-4 text-center max-w-md">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-scale-10 font-bold mb-1">Sem dados para o período</h3>
            <p className="text-scale-7 text-muted-foreground">
              Não há dados disponíveis para {QUARTERS.find(q => q.value === selectedQuarter)?.label} de {selectedYear}.
              Selecione outro período ou verifique se os dados foram carregados.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

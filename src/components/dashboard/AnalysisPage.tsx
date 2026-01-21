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
import { BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortOrder = "default" | "best-to-worst" | "worst-to-best";

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
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  const quarterlyKPIs = useMemo(
    () => processQuarterlyDashboardData(processedData, selectedYear, selectedQuarter, selectedAssessor),
    [processedData, selectedYear, selectedQuarter, selectedAssessor]
  );

  // Calculate ideal rhythm based on business days
  const ritmoIdeal = useMemo(
    () => calculateQuarterlyIdealRhythm(selectedYear, selectedQuarter),
    [selectedYear, selectedQuarter]
  );

  // Sort KPIs based on selected order
  const sortedKPIs = useMemo(() => {
    if (sortOrder === "default") return quarterlyKPIs;
    
    return [...quarterlyKPIs].sort((a, b) => {
      if (sortOrder === "best-to-worst") {
        return b.percentage - a.percentage;
      }
      return a.percentage - b.percentage; // worst-to-best
    });
  }, [quarterlyKPIs, sortOrder]);

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

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar:</span>
            <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as SortOrder)}>
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
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {/* KPI Bars - Responsive layout without scroll on desktop/TV */}
      {hasData ? (
        <div className="flex-1 min-h-0 flex flex-col gap-responsive-sm overflow-hidden lg:overflow-hidden overflow-y-auto">
          {sortedKPIs.map((kpi) => (
            <div key={kpi.label} className="lg:flex-1 lg:min-h-0 shrink-0 lg:shrink">
              <QuarterlyKPIBar {...kpi} ritmoIdeal={ritmoIdeal} />
            </div>
          ))}
        </div>
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

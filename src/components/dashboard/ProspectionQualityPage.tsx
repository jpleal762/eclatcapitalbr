import { useState, useMemo } from "react";
import { ProcessedKPI, PROSPECTION_QUALITY_KPIS } from "@/types/kpi";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import {
  filterByCategory,
  filterByAssessor,
  getMonthValue,
  calculateIdealRhythm,
} from "@/lib/kpiUtils";

interface ProspectionQualityPageProps {
  processedData: ProcessedKPI[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isAssessorLocked?: boolean;
}

interface ProspectionKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency: boolean;
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(1)}Mi`;
    } else if (value >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  }
  return value.toFixed(0);
}

function isPlannedMonthStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("planejado m") || s === "planejado mês" || s === "planejado mes";
}

function isRealizedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("realizado") || s.includes("real.") || s === "realizado";
}

export function ProspectionQualityPage({
  processedData,
  assessors,
  months,
  selectedAssessor,
  selectedMonth,
  onAssessorChange,
  onMonthChange,
  isAssessorLocked = false,
}: ProspectionQualityPageProps) {
  const ritmoIdeal = useMemo(
    () => calculateIdealRhythm(selectedMonth),
    [selectedMonth]
  );

  const kpiData = useMemo(() => {
    const result: ProspectionKPI[] = [];

    PROSPECTION_QUALITY_KPIS.forEach((kpiConfig) => {
      const categoryData = filterByCategory(processedData, kpiConfig.category);
      const filteredData = filterByAssessor(categoryData, selectedAssessor);

      const plannedData = filteredData.filter((d) => isPlannedMonthStatus(d.status));
      const realizedData = filteredData.filter((d) => isRealizedStatus(d.status));

      const target = getMonthValue(plannedData, selectedMonth);
      const value = getMonthValue(realizedData, selectedMonth);
      const percentage = target > 0 ? Math.round((value / target) * 100) : 0;

      result.push({
        label: kpiConfig.label,
        value,
        target,
        percentage,
        isCurrency: kpiConfig.isCurrency,
      });
    });

    return result;
  }, [processedData, selectedAssessor, selectedMonth]);

  const hasData = kpiData.some((kpi) => kpi.target > 0 || kpi.value > 0);

  return (
    <div className="h-full flex flex-col gap-2 animate-fade-in">
      {/* Header with filters */}
      <Card className="p-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Users className="size-scale-2.5 text-primary" />
            <h2 className="text-scale-9 font-bold text-foreground">
              Prospecção e Qualidade
            </h2>
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
            <Select
              value={selectedAssessor}
              onValueChange={onAssessorChange}
              disabled={isAssessorLocked}
            >
              <SelectTrigger
                className={`w-[80px] h-scale-4 text-scale-6 ${
                  isAssessorLocked ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODOS</SelectItem>
                {assessors.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1">
            <span className="text-scale-7 text-muted-foreground">Mês:</span>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[70px] h-scale-4 text-scale-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPI Bars */}
      {hasData ? (
        <div className="flex-1 min-h-0 flex flex-col gap-1 lg:gap-2 overflow-hidden lg:overflow-hidden overflow-y-auto">
          {kpiData.map((kpi) => (
            <ProspectionKPIBar
              key={kpi.label}
              {...kpi}
              ritmoIdeal={ritmoIdeal}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-4 text-center max-w-md">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-scale-10 font-bold mb-1">Sem dados para o período</h3>
            <p className="text-scale-7 text-muted-foreground">
              Não há dados de prospecção disponíveis para {selectedMonth}. 
              Verifique se os dados foram carregados ou selecione outro período.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============= KPI Bar Component =============
interface ProspectionKPIBarProps {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency: boolean;
  ritmoIdeal: number;
}

function ProspectionKPIBar({
  label,
  value,
  target,
  percentage,
  isCurrency,
  ritmoIdeal,
}: ProspectionKPIBarProps) {
  const isOnTrack = percentage >= ritmoIdeal;
  const remaining = Math.max(0, target - value);
  const cappedPercentage = Math.min(percentage, 100);

  // Determine bar color based on performance vs ritmo ideal
  const getBarColor = () => {
    if (percentage >= ritmoIdeal * 1.2) return "bg-emerald-500";
    if (percentage >= ritmoIdeal) return "bg-green-500";
    if (percentage >= ritmoIdeal * 0.5) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-2 lg:p-3 flex-1 min-h-0 flex flex-col justify-center">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-scale-8 lg:text-scale-9 font-bold text-foreground uppercase">
            {label}
          </span>
          {!isOnTrack && target > 0 && (
            <span className="px-1 py-0.5 text-scale-5 lg:text-scale-6 rounded bg-red-500/10 text-red-500 border border-red-500/20">
              -{(ritmoIdeal - percentage).toFixed(0)}% ritmo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-scale-6 lg:text-scale-7 text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{formatValue(value, isCurrency)}</span>
            {" / "}
            {formatValue(target, isCurrency)}
          </span>
          <span
            className={`font-bold text-scale-8 lg:text-scale-9 ${
              isOnTrack ? "text-green-500" : "text-amber-500"
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-scale-3 lg:h-scale-4 bg-muted rounded-full overflow-hidden">
        {/* Ritmo Ideal Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
          style={{ left: `${Math.min(ritmoIdeal, 100)}%` }}
        />
        
        {/* Progress */}
        <div
          className={`h-full ${getBarColor()} transition-all duration-500 rounded-full`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>

      {/* Remaining */}
      {remaining > 0 && (
        <div className="mt-0.5 text-scale-5 lg:text-scale-6 text-muted-foreground">
          Faltam: <span className="font-semibold">{formatValue(remaining, isCurrency)}</span>
        </div>
      )}
    </Card>
  );
}

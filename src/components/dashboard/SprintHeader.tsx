import { Target, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SprintGlobalStats, SprintEvolution48h, SprintProductConfig } from "@/types/kpi";

interface SprintHeaderProps {
  globalStats: SprintGlobalStats;
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
  evolution48h?: SprintEvolution48h | null;
  availableProducts: SprintProductConfig[];
  selectedProducts: string[];
  onProductToggle: (category: string) => void;
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

export function SprintHeader({
  globalStats,
  assessors,
  months,
  selectedAssessor,
  selectedMonth,
  onAssessorChange,
  onMonthChange,
  isLocked = false,
  evolution48h,
  availableProducts,
  selectedProducts,
  onProductToggle,
}: SprintHeaderProps) {
  const {
    totalObjective,
    totalProduced,
    totalStillMissing,
    globalProgressPercentage,
    kpisCompleted,
    kpisTotal,
  } = globalStats;

  return (
    <div className="bg-card rounded-lg border border-border p-3 lg:p-4 mb-3 lg:mb-4 flex-shrink-0">
      {/* Top Row: Title + Filters */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Sprint Semanal</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">
              MISSÃO: Zerar o gap entre META e REALIZADO
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedAssessor}
            onValueChange={onAssessorChange}
            disabled={isLocked}
          >
            <SelectTrigger className="w-[140px] lg:w-[180px] h-8 text-xs lg:text-sm">
              <SelectValue placeholder="Assessor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Assessores</SelectItem>
              {assessors.map((assessor) => (
                <SelectItem key={assessor} value={assessor}>
                  {assessor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[100px] lg:w-[120px] h-8 text-xs lg:text-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Selection Checkboxes */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 p-2 bg-muted/20 rounded-lg">
        <span className="text-[10px] lg:text-xs text-muted-foreground font-medium mr-1">Produtos:</span>
        {availableProducts?.map(product => (
          <label key={product.category} className="flex items-center gap-1.5 cursor-pointer hover:bg-muted/30 px-2 py-1 rounded">
            <Checkbox 
              checked={selectedProducts?.includes(product.category) ?? false}
              onCheckedChange={() => onProductToggle(product.category)}
              className="h-3.5 w-3.5"
            />
            <span className="text-[10px] lg:text-xs text-foreground">{product.label}</span>
          </label>
        ))}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-3">
        {/* Objetivo Total */}
        <div className="bg-muted/30 rounded-lg p-2 lg:p-3 text-center">
          <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Meta Total
          </p>
          <p className="text-sm lg:text-lg font-bold text-foreground">
            {formatValue(totalObjective)}
          </p>
        </div>

        {/* Produzido */}
        <div className="bg-muted/30 rounded-lg p-2 lg:p-3 text-center">
          <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Produzido
          </p>
          <p className="text-sm lg:text-lg font-bold text-green-500">
            {formatValue(totalProduced)}
          </p>
        </div>

        {/* O QUE FALTA - Highlighted */}
        <div className={cn(
          "rounded-lg p-2 lg:p-3 text-center relative overflow-hidden",
          totalStillMissing > 0 
            ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-destructive/50" 
            : "bg-green-500/20 border-2 border-green-500/50"
        )}>
          {totalStillMissing > 0 && (
            <div className="absolute top-1 right-1">
              <AlertTriangle className="h-3 w-3 text-destructive animate-pulse" />
            </div>
          )}
          <p className="text-[10px] lg:text-xs uppercase tracking-wide mb-1 font-bold text-destructive">
            O QUE FALTA
          </p>
          <p className={cn(
            "text-base lg:text-xl font-black",
            totalStillMissing > 0 ? "text-destructive" : "text-green-500"
          )}>
            {totalStillMissing > 0 ? formatValue(totalStillMissing) : "ZERADO!"}
          </p>
          {totalStillMissing > 0 && (
            <p className="text-[8px] lg:text-[9px] text-destructive/80 font-medium">
              OBJETIVO: ZERAR
            </p>
          )}
        </div>

        {/* KPIs Zerados */}
        <div className="bg-green-500/10 rounded-lg p-2 lg:p-3 text-center">
          <p className="text-[10px] lg:text-xs text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
            Zerados
          </p>
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-sm lg:text-lg font-bold text-green-500">
              {kpisCompleted}/{kpisTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="mb-2">
        <div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              globalProgressPercentage >= 100 ? "bg-green-500" : "bg-eclat-gradient"
            )}
            style={{ width: `${Math.min(globalProgressPercentage, 100)}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] lg:text-xs font-bold text-foreground/80">
            {Math.round(globalProgressPercentage)}% concluído
          </span>
        </div>
      </div>

      {/* Evolution 48h (if available) */}
      {evolution48h && (
        <div className="flex items-center justify-center gap-2 text-xs lg:text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>
            Evolução {evolution48h.hoursAgo}h: 
            <span className="text-green-500 font-medium ml-1">
              +{formatValue(evolution48h.totalProducedDiff)}
            </span>
            {evolution48h.kpisCompletedDiff > 0 && (
              <span className="text-green-500 font-medium ml-1">
                | +{evolution48h.kpisCompletedDiff} KPI zerado
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

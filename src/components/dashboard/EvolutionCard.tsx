import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { KPIEvolutionItem } from "@/lib/evolutionUtils";

interface EvolutionCardProps {
  evolutionData: KPIEvolutionItem[];
  snapshotDate: string | null;
  daysAgo: number;
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
    return `R$ ${value.toFixed(0)}`;
  }
  return value.toFixed(0);
}

function formatTimeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffDays > 0) return `${diffDays}d atrás`;
  if (diffHours > 0) return `${diffHours}h atrás`;
  return "agora";
}

export function EvolutionCard({ evolutionData, snapshotDate, daysAgo }: EvolutionCardProps) {
  const filteredData = useMemo(
    () => evolutionData.filter(item => item.delta !== 0 || item.currentValue > 0 || item.previousValue > 0),
    [evolutionData]
  );

  if (!snapshotDate || filteredData.length === 0) {
    return (
      <Card className="p-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Clock className="size-scale-2.5 text-muted-foreground" />
          <span className="text-scale-7 font-bold text-foreground">Evolução {daysAgo} dias</span>
        </div>
        <p className="text-scale-6 text-muted-foreground">
          Sem snapshot anterior para comparação. Faça pelo menos 2 uploads em dias diferentes.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <TrendingUp className="size-scale-2.5 text-primary" />
        <span className="text-scale-7 font-bold text-foreground">Evolução {daysAgo} dias</span>
        <span className="text-scale-5 text-muted-foreground ml-auto">
          vs. {formatTimeSince(snapshotDate)}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
        {filteredData.map((item) => {
          const isPositive = item.delta > 0;
          const isZero = item.delta === 0;
          
          return (
            <div
              key={item.category}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-muted/50 border border-border/50"
            >
              {isZero ? (
                <Minus className="size-scale-2 text-muted-foreground shrink-0" />
              ) : isPositive ? (
                <TrendingUp className="size-scale-2 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="size-scale-2 text-red-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-scale-5 text-muted-foreground block truncate">{item.label}</span>
                <span className={`text-scale-6 font-bold block ${
                  isZero ? "text-muted-foreground" : isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {isPositive ? "+" : ""}{formatValue(item.delta, item.isCurrency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

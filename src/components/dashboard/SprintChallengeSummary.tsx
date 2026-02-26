import { SprintChallenge, SPRINT_PRODUCTS } from "@/types/kpi";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { cn } from "@/lib/utils";

interface SprintChallengeSummaryProps {
  challenges: SprintChallenge[];
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`;
    return `R$${value.toFixed(0)}`;
  }
  return value.toFixed(0);
}

interface KPISummaryRow {
  category: string;
  label: string;
  isCurrency: boolean;
  realized: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
}


export function SprintChallengeSummary({ challenges }: SprintChallengeSummaryProps) {
  if (challenges.length === 0) return null;

  // Group by category and sum across all assessors
  const categoryMap = new Map<string, { realized: number; target: number; challenges: SprintChallenge[] }>();
  challenges.forEach(c => {
    const existing = categoryMap.get(c.category) || { realized: 0, target: 0, challenges: [] };
    existing.realized += c.realized_value ?? 0;
    existing.target += c.target_value;
    existing.challenges.push(c);
    categoryMap.set(c.category, existing);
  });

  const rows: KPISummaryRow[] = Array.from(categoryMap.entries()).map(([category, data]) => {
    const product = SPRINT_PRODUCTS.find(p => p.category === category);
    const percentage = data.target > 0 ? Math.min((data.realized / data.target) * 100, 100) : 0;
    return {
      category,
      label: product?.label ?? category,
      isCurrency: product?.isCurrency ?? false,
      realized: data.realized,
      target: data.target,
      percentage,
      isCompleted: percentage >= 100,
    };
  });

  const globalPercentage = rows.length > 0
    ? Math.min(rows.reduce((s, r) => s + r.percentage, 0) / rows.length, 100)
    : 0;
  const isCompleted = globalPercentage >= 100;
  const completedCount = rows.filter(r => r.isCompleted).length;

  const nearestDeadline = challenges
    .map(c => c.deadline)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  const expired = new Date(nearestDeadline).getTime() <= Date.now();

  const globalBarColor = expired
    ? "bg-muted"
    : isCompleted
    ? "bg-green-500"
    : globalPercentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className={cn(
      "rounded-lg border p-3 lg:p-4 transition-all h-full",
      isCompleted && "border-green-500/50 bg-green-500/5"
    )}>
      <ConfettiCelebration trigger={isCompleted && !expired} />

      {/* Header with mascot */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-scale-8 lg:text-scale-9 font-bold">Progresso Geral</span>
          </div>
          <div className="w-full h-3 lg:h-4 bg-secondary rounded-full overflow-hidden mt-1">
            <div className={cn("h-full rounded-full transition-all duration-700", globalBarColor)}
              style={{ width: `${globalPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-scale-6 text-muted-foreground">
              {globalPercentage.toFixed(0)}% geral
            </span>
            <span className="text-scale-6 text-muted-foreground">
              {completedCount}/{rows.length} KPIs
            </span>
          </div>
        </div>
      </div>

      {/* Per-KPI rows — sem barra, produção / meta bem visível */}
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2">
        {rows.map(r => {
          const pctColor = expired
            ? "text-muted-foreground"
            : r.isCompleted
            ? "text-green-500"
            : r.percentage >= 50
            ? "text-yellow-500"
            : "text-red-500";

          return (
            <div key={r.category} className="flex flex-col gap-0.5 min-w-0">
              <span className="text-scale-6 lg:text-scale-7 font-medium truncate text-muted-foreground">
                {r.label}
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-scale-8 lg:text-scale-9 font-bold text-foreground leading-none">
                    {formatValue(r.realized, r.isCurrency)}
                  </span>
                  <span className="text-scale-6 text-muted-foreground">/{formatValue(r.target, r.isCurrency)}</span>
                </div>
                <span className={cn("text-scale-7 lg:text-scale-8 font-black leading-none flex-shrink-0", pctColor)}>
                  {r.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

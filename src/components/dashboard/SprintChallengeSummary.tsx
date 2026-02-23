import { SprintChallenge, SPRINT_PRODUCTS } from "@/types/kpi";
import { SprintMascot } from "./SprintMascot";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { cn } from "@/lib/utils";

interface SprintChallengeSummaryProps {
  challenges: SprintChallenge[];
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`;
  return `R$${value.toFixed(0)}`;
}

export function SprintChallengeSummary({ challenges }: SprintChallengeSummaryProps) {
  if (challenges.length === 0) return null;

  let totalTarget = 0;
  let totalRealized = 0;
  let completedKPIs = 0;

  challenges.forEach(c => {
    totalTarget += c.target_value;
    const realized = c.realized_value ?? 0;
    totalRealized += realized;
    if (realized >= c.target_value) completedKPIs++;
  });

  const globalPercentage = totalTarget > 0 ? Math.min((totalRealized / totalTarget) * 100, 100) : 0;
  const isCompleted = globalPercentage >= 100;

  const nearestDeadline = challenges
    .map(c => c.deadline)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  const expired = new Date(nearestDeadline).getTime() <= Date.now();

  const barColor = isCompleted
    ? "bg-green-500"
    : globalPercentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className={cn(
      "rounded-lg border p-3 lg:p-4 transition-all mb-3",
      isCompleted && "border-green-500/50 bg-green-500/5"
    )}>
      <ConfettiCelebration trigger={isCompleted && !expired} />

      <div className="flex items-center gap-3">
        <SprintMascot
          progressPercent={globalPercentage}
          isCompleted={isCompleted && !expired}
          className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-scale-7 lg:text-scale-8 font-bold">Progresso Geral</span>
          </div>
          <div className="w-full h-3 lg:h-4 bg-secondary rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-700", barColor)}
              style={{ width: `${globalPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-scale-6 text-muted-foreground">
              {formatValue(totalRealized)} / {formatValue(totalTarget)} ({globalPercentage.toFixed(0)}%)
            </span>
            <span className="text-scale-6">
              {completedKPIs} de {challenges.length} KPIs concluídos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

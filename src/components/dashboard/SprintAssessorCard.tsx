import { SprintChallenge, SprintKPIData, SPRINT_PRODUCTS } from "@/types/kpi";
import { SprintMascot } from "./SprintMascot";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useState } from "react";

interface SprintAssessorCardProps {
  assessorName: string;
  challenges: SprintChallenge[];
  sprintData: SprintKPIData[];
  onDelete: () => void;
  onKPIClick?: (category: string) => void;
}

function getCountdown(deadline: string): { label: string; urgent: boolean; expired: boolean } {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;
  if (diff <= 0) return { label: "Expirado", urgent: false, expired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return { label: `${days}d ${remainingHours}h`, urgent: hours < 24, expired: false };
  return { label: `${remainingHours}h`, urgent: true, expired: false };
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`;
    return `R$${value.toFixed(0)}`;
  }
  return value.toFixed(0);
}

interface KPIRow {
  challenge: SprintChallenge;
  realized: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
  isCurrency: boolean;
  label: string;
}

export function SprintAssessorCard({ assessorName, challenges, sprintData, onDelete, onKPIClick }: SprintAssessorCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build KPI rows
  const rows: KPIRow[] = challenges.map(c => {
    const kpiData = sprintData.find(s => s.category === c.category);
    const assessorData = kpiData?.assessorBreakdown.find(a => a.name === c.assessor_name);
    const realized = assessorData?.contribution ?? 0;
    const target = c.target_value;
    const percentage = target > 0 ? Math.min((realized / target) * 100, 100) : 0;
    const product = SPRINT_PRODUCTS.find(p => p.category === c.category);
    return {
      challenge: c,
      realized,
      target,
      percentage,
      isCompleted: percentage >= 100,
      isCurrency: product?.isCurrency ?? false,
      label: product?.label ?? c.category,
    };
  });

  // Aggregate
  const totalTarget = rows.reduce((s, r) => s + r.target, 0);
  const totalRealized = rows.reduce((s, r) => s + r.realized, 0);
  const globalPercentage = totalTarget > 0 ? Math.min((totalRealized / totalTarget) * 100, 100) : 0;
  const allCompleted = rows.every(r => r.isCompleted);
  const completedCount = rows.filter(r => r.isCompleted).length;

  // Nearest deadline
  const nearestDeadline = challenges
    .map(c => c.deadline)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  const countdown = getCountdown(nearestDeadline);

  const handleDeleteKPI = async (id: string) => {
    setDeletingId(id);
    await supabase.from("sprint_challenges" as any).delete().eq("id", id);
    onDelete();
  };

  const globalBarColor = countdown.expired
    ? "bg-muted"
    : allCompleted
    ? "bg-green-500"
    : globalPercentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className={cn(
      "rounded-lg border p-3 lg:p-4 transition-all",
      countdown.expired && "opacity-60 border-muted",
      countdown.urgent && !allCompleted && !countdown.expired && "border-red-500 animate-pulse",
      allCompleted && !countdown.expired && "border-green-500/50 bg-green-500/5"
    )}>
      <ConfettiCelebration trigger={allCompleted && !countdown.expired} />

      {/* Header: Assessor name + countdown */}
      <div className="flex items-center gap-2 mb-2">
        <SprintMascot
          progressPercent={globalPercentage}
          isCompleted={allCompleted && !countdown.expired}
          className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-scale-7 lg:text-scale-8 font-bold truncate">
              {assessorName.split(" ")[0]}
            </span>
            <span className={cn(
              "text-scale-5 lg:text-scale-6 font-bold whitespace-nowrap",
              countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-red-500" : "text-muted-foreground"
            )}>
              ⏱ {countdown.label}
            </span>
          </div>
          {/* Global progress bar */}
          <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", globalBarColor)}
              style={{ width: `${globalPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-scale-5 text-muted-foreground">
              {globalPercentage.toFixed(0)}% geral
            </span>
            <span className="text-scale-5 text-muted-foreground">
              {completedCount}/{rows.length} KPIs
            </span>
          </div>
        </div>
      </div>

      {/* Individual KPI rows */}
      <div className="space-y-1.5 mt-2">
        {rows.map(r => {
          const barColor = countdown.expired
            ? "bg-muted"
            : r.isCompleted
            ? "bg-green-500"
            : r.percentage >= 50
            ? "bg-yellow-500"
            : "bg-red-500";

          return (
            <div
              key={r.challenge.id}
              className={cn(
                "group flex items-center gap-2",
                onKPIClick && "cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1 transition-colors"
              )}
              onClick={() => onKPIClick?.(r.challenge.category)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-scale-5 lg:text-scale-6 font-medium truncate">
                    {r.label}
                  </span>
                  <span className="text-scale-5 text-muted-foreground whitespace-nowrap">
                    {formatValue(r.realized, r.isCurrency)} / {formatValue(r.target, r.isCurrency)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{ width: `${r.percentage}%` }} />
                </div>
              </div>
              <span className="text-scale-5 font-semibold w-8 text-right">
                {r.percentage.toFixed(0)}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteKPI(r.challenge.id); }}
                disabled={deletingId === r.challenge.id}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

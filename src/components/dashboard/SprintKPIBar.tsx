import { useState, useEffect, useRef } from "react";
import { Check, Flame, Timer, Target, Trophy, PartyPopper, TrendingUp } from "lucide-react";
import { SprintKPIData, SprintEvolution } from "@/types/kpi";
import { cn } from "@/lib/utils";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface SprintKPIBarProps {
  data: SprintKPIData;
  evolution?: SprintEvolution;
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  }
  return value.toString();
}

function getUrgencyIcon(progressPercentage: number, isCompleted: boolean) {
  if (isCompleted) {
    return (
      <div className="flex items-center gap-1">
        <Trophy className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 animate-trophy-celebrate" />
        <PartyPopper className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 animate-celebrate-pop" />
      </div>
    );
  }
  if (progressPercentage >= 80) {
    return <Target className="h-3 w-3 lg:h-4 lg:w-4 text-green-400" />;
  }
  if (progressPercentage >= 50) {
    return <Timer className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />;
  }
  return <Flame className="h-3 w-3 lg:h-4 lg:w-4 text-destructive animate-pulse" />;
}

export function SprintKPIBar({ data, evolution }: SprintKPIBarProps) {
  const {
    label,
    totalRemaining,
    totalRealized,
    totalTarget,
    progressPercentage,
    isCurrency,
    isCompleted,
    assessorBreakdown,
  } = data;

  // Confetti trigger logic
  const [justCompleted, setJustCompleted] = useState(false);
  const wasCompletedRef = useRef(isCompleted);

  useEffect(() => {
    if (isCompleted && !wasCompletedRef.current) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 3000);
      return () => clearTimeout(timer);
    }
    wasCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Determine bar color based on progress
  const getBarColorClass = () => {
    if (isCompleted) return "bg-green-500";
    if (progressPercentage >= 50) return "bg-eclat-gradient";
    return "bg-red-gradient";
  };

  return (
    <div className="p-2 lg:p-3 bg-card rounded-lg border border-border flex-1 flex flex-col min-h-0 overflow-hidden">
      <ConfettiCelebration trigger={justCompleted} />
      
      {/* Header: Icon + Label + Percentage */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {getUrgencyIcon(progressPercentage, isCompleted)}
          <span className="text-xs lg:text-sm font-semibold text-foreground truncate">
            {label}
          </span>
        </div>
        <span className={cn(
          "font-bold text-sm lg:text-base",
          isCompleted ? "text-green-500" : progressPercentage >= 50 ? "text-eclat-gold" : "text-destructive"
        )}>
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Compact Values Row: Meta | Realizado | Falta */}
      <div className="grid grid-cols-3 gap-1 mb-1 text-center text-[9px] lg:text-[10px]">
        <div>
          <span className="text-muted-foreground">Meta: </span>
          <span className="font-medium text-foreground">{formatValue(totalTarget, isCurrency)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Real: </span>
          <span className="font-medium text-green-500">{formatValue(totalRealized, isCurrency)}</span>
        </div>
        <div className={cn(isCompleted ? "text-green-500" : "text-destructive font-bold")}>
          {isCompleted ? "✓ Zerado" : `Falta: ${formatValue(totalRemaining, isCurrency)}`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden mb-1">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getBarColorClass()
          )}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {/* Evolution indicator (48h) */}
      {evolution && evolution.difference !== 0 && (
        <div className="flex items-center gap-1 text-[9px] lg:text-[10px] mb-1">
          <TrendingUp className={cn(
            "h-3 w-3",
            evolution.difference > 0 ? "text-green-500" : "text-destructive"
          )} />
          <span className={evolution.difference > 0 ? "text-green-500" : "text-destructive"}>
            {evolution.difference > 0 ? "+" : ""}{formatValue(evolution.difference, isCurrency)} em {evolution.hoursAgo}h
            {evolution.percentageChange !== 0 && (
              <span className="text-muted-foreground ml-1">
                ({evolution.difference > 0 ? "↑" : "↓"}{Math.abs(Math.round(evolution.percentageChange))}%)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Assessor Breakdown - grid format showing all assessors */}
      {assessorBreakdown.length > 0 && (
        <div className="mt-auto pt-1 border-t border-border/50">
          <span className="text-[9px] lg:text-[10px] text-muted-foreground mb-1 block">
            Falta por Assessor:
          </span>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
            {assessorBreakdown.map((assessor, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex flex-col items-center px-1.5 py-1 rounded text-center",
                  assessor.achieved 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-destructive/10 text-destructive"
                )}
              >
                <span className="text-[10px] lg:text-[11px] font-medium">
                  {assessor.name}
                </span>
                <span className="text-[11px] lg:text-[12px] font-bold">
                  {assessor.achieved 
                    ? "✓" 
                    : formatValue(assessor.remaining, isCurrency)
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message when all achieved */}
      {isCompleted && assessorBreakdown.length === 0 && (
        <div className="mt-auto text-[9px] lg:text-[10px] text-green-500 font-medium">
          ✓ Todos os assessores atingiram a meta!
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Check, AlertTriangle, Flame, Timer, Target, Trophy, PartyPopper, TrendingUp } from "lucide-react";
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
        <Trophy className="h-4 w-4 text-green-500 animate-trophy-celebrate" />
        <PartyPopper className="h-4 w-4 text-green-500 animate-celebrate-pop" />
      </div>
    );
  }
  if (progressPercentage >= 80) {
    return <Target className="h-4 w-4 text-green-400" />;
  }
  if (progressPercentage >= 50) {
    return <Timer className="h-4 w-4 text-yellow-500" />;
  }
  return <Flame className="h-4 w-4 text-destructive animate-pulse" />;
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

  // Format the objective display
  const objectiveDisplay = isCompleted
    ? "ZERADO!"
    : `Objetivo: ${formatValue(totalRemaining, isCurrency)}`;

  return (
    <div className="p-3 lg:p-4 bg-card rounded-lg border border-border flex-1 flex flex-col min-h-0">
      <ConfettiCelebration trigger={justCompleted} />
      
      {/* Header: Label + Urgency Icon + Objective */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getUrgencyIcon(progressPercentage, isCompleted)}
          <span className="text-sm lg:text-base font-semibold text-foreground truncate">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-green-500 text-xs lg:text-sm font-bold">
              <Check className="h-4 w-4" />
              {objectiveDisplay}
            </span>
          ) : (
            <span className={cn(
              "text-xs lg:text-sm font-medium",
              progressPercentage < 50 ? "text-destructive" : "text-muted-foreground"
            )}>
              {progressPercentage < 50 && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              {objectiveDisplay}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 lg:h-5 w-full rounded-full bg-muted/30 overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getBarColorClass()
          )}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
        {/* Percentage overlay */}
        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] lg:text-xs font-bold text-foreground/80">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Meta vs Realizado */}
      <div className="flex items-center justify-between text-[10px] lg:text-xs text-muted-foreground mb-2">
        <span>Realizado: {formatValue(totalRealized, isCurrency)}</span>
        <span>Meta Semanal: {formatValue(totalTarget, isCurrency)}</span>
      </div>

      {/* Evolution indicator (48h) */}
      {evolution && evolution.difference !== 0 && (
        <div className="flex items-center gap-1 text-[10px] lg:text-xs mb-2">
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

      {/* Assessor Breakdown */}
      {assessorBreakdown.length > 0 && (
        <div className="mt-auto">
          <span className="text-[10px] lg:text-xs text-muted-foreground block mb-1">
            Falta por Assessor:
          </span>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {assessorBreakdown.slice(0, 6).map((assessor, idx) => (
              <span key={idx} className="text-[10px] lg:text-xs">
                <span className="font-medium text-foreground">{assessor.name}</span>
                <span className="text-muted-foreground">
                  {" "}-{formatValue(assessor.remaining, isCurrency)}
                </span>
              </span>
            ))}
            {assessorBreakdown.length > 6 && (
              <span className="text-[10px] lg:text-xs text-muted-foreground">
                +{assessorBreakdown.length - 6} mais
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message when all achieved */}
      {isCompleted && assessorBreakdown.length === 0 && (
        <div className="mt-auto text-[10px] lg:text-xs text-green-500 font-medium">
          ✓ Todos os assessores atingiram a meta!
        </div>
      )}
    </div>
  );
}

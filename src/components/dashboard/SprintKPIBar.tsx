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
        <Trophy className="size-scale-1.5 lg:size-scale-2 text-green-500 animate-trophy-celebrate" />
        <PartyPopper className="size-scale-1.5 lg:size-scale-2 text-green-500 animate-celebrate-pop" />
      </div>
    );
  }
  if (progressPercentage >= 80) {
    return <Target className="size-scale-1.5 lg:size-scale-2 text-green-400" />;
  }
  if (progressPercentage >= 50) {
    return <Timer className="size-scale-1.5 lg:size-scale-2 text-yellow-500" />;
  }
  return <Flame className="size-scale-1.5 lg:size-scale-2 text-red-400 animate-pulse" />;
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
    <div className="p-1 lg:p-1.5 bg-card rounded-lg border border-border flex-1 flex flex-col min-h-0 overflow-hidden">
      <ConfettiCelebration trigger={justCompleted} />
      
      {/* Header: Icon + Label + Percentage */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {getUrgencyIcon(progressPercentage, isCompleted)}
          <span className="text-scale-6 lg:text-scale-7 font-semibold text-foreground truncate">
            {label}
          </span>
        </div>
        <span className={cn(
          "font-bold text-scale-7 lg:text-scale-8",
          isCompleted ? "text-green-500" : progressPercentage >= 50 ? "text-eclat-gold" : "text-red-400"
        )}>
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Compact Values Row: Meta | Realizado | Falta */}
      <div className="grid grid-cols-3 gap-1 mb-1 text-center text-scale-5">
        <div>
          <span className="text-muted-foreground">Meta: </span>
          <span className="font-medium text-foreground">{formatValue(totalTarget, isCurrency)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Real: </span>
          <span className="font-medium text-green-500">{formatValue(totalRealized, isCurrency)}</span>
        </div>
        <div className={cn(
          isCompleted 
            ? "text-green-500" 
            : "text-red-400 font-bold"
        )}>
          {isCompleted ? "✓ Zerado" : `Falta: ${formatValue(totalRemaining, isCurrency)}`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-scale-1.5 lg:h-scale-2 w-full rounded-full bg-muted/30 overflow-hidden mb-1">
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
        <div className="flex items-center gap-1 text-scale-5 mb-1">
          <TrendingUp className={cn(
            "size-scale-1.5",
            evolution.difference > 0 ? "text-green-500" : "text-red-400"
          )} />
          <span className={evolution.difference > 0 ? "text-green-500" : "text-red-400"}>
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
          <span className="text-scale-5 text-muted-foreground mb-1 block">
            Falta por Assessor:
          </span>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1">
            {assessorBreakdown.map((assessor, idx) => {
              // Calcular progresso individual
              const individualTarget = (assessor.contribution || 0) + assessor.remaining;
              const progressPercent = individualTarget > 0 
                ? ((assessor.contribution || 0) / individualTarget) * 100 
                : 0;
              
              // Determinar classe de cor: verde (atingiu), amarelo (>=50%), vermelho (<50%)
              const colorClass = assessor.achieved
                ? "bg-green-500/15 text-green-400 border border-green-500/20"
                : progressPercent >= 50
                  ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30";
              
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex flex-col items-center px-1 py-1 rounded text-center",
                    colorClass
                  )}
                >
                  <span className="text-scale-5 lg:text-scale-6 font-medium">
                    {assessor.name}
                  </span>
                  <span className="text-scale-6 font-bold">
                    {assessor.achieved 
                      ? "✓" 
                      : formatValue(assessor.remaining, isCurrency)
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message when all achieved */}
      {isCompleted && assessorBreakdown.length === 0 && (
        <div className="mt-auto text-scale-5 text-green-500 font-medium">
          ✓ Todos os assessores atingiram a meta!
        </div>
      )}
    </div>
  );
}

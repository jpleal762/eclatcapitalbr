import { useState, useEffect, useRef } from "react";
import { TrendingUp, Minus } from "lucide-react";
import { SprintKPIData, SprintEvolution } from "@/types/kpi";
import { cn } from "@/lib/utils";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { SprintMascot } from "./SprintMascot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      
      {/* Header: Mascot + Label + Percentage */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <SprintMascot 
            progressPercent={progressPercentage} 
            isCompleted={isCompleted} 
          />
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

      {/* Progress Bar - Horizontal style */}
      <div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden mb-1">
        {/* Filled portion */}
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getBarColorClass()
          )}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {/* Evolution indicator (48h) - always visible when available */}
      {evolution && (
        <div className="flex items-center gap-1 text-scale-5 mb-1">
          {evolution.difference > 0 ? (
            <TrendingUp className="size-scale-1.5 text-green-500" />
          ) : evolution.difference < 0 ? (
            <TrendingUp className="size-scale-1.5 text-red-400 rotate-180" />
          ) : (
            <Minus className="size-scale-1.5 text-muted-foreground" />
          )}
          <span className={cn(
            evolution.difference > 0 ? "text-green-500" : 
            evolution.difference < 0 ? "text-red-400" : "text-muted-foreground"
          )}>
            {evolution.difference === 0 ? (
              <span>Sem variação ({evolution.hoursAgo}h)</span>
            ) : (
              <>
                {evolution.difference > 0 ? "+" : ""}{formatValue(evolution.difference, isCurrency)} em {evolution.hoursAgo}h
                {evolution.percentageChange !== 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({evolution.difference > 0 ? "↑" : "↓"}{Math.abs(Math.round(evolution.percentageChange))}%)
                  </span>
                )}
              </>
            )}
          </span>
        </div>
      )}

      {/* Assessor Breakdown - grid format showing all assessors */}
      {assessorBreakdown.length > 0 && (
        <div className="mt-auto pt-1 border-t border-border/50">
          <span className="text-scale-7 text-muted-foreground mb-1 block font-semibold">
            Falta por Assessor:
          </span>
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-1">
              {(() => {
                // Find the top 2 remaining (non-achieved) assessors
                const nonAchieved = assessorBreakdown
                  .map((a, i) => ({ ...a, originalIdx: i }))
                  .filter(a => !a.achieved)
                  .sort((a, b) => b.remaining - a.remaining);
                const top2Indices = new Set(nonAchieved.slice(0, 2).map(a => a.originalIdx));

                return assessorBreakdown.map((assessor, idx) => {
                  // Calcular progresso individual
                  const individualTarget = (assessor.contribution || 0) + assessor.remaining;
                  const progressPercent = individualTarget > 0 
                    ? ((assessor.contribution || 0) / individualTarget) * 100 
                    : 0;
                  
                  const isTop2 = top2Indices.has(idx);
                  
                  // Determinar classe de cor: verde (atingiu), top2 (destaque forte), amarelo (>=50%), vermelho (<50%)
                  const colorClass = assessor.achieved
                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : isTop2
                      ? "bg-red-500/40 text-white border-2 border-red-400 ring-2 ring-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                      : progressPercent >= 50
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30";
                  
                  // Hover elegante (sem animações infinitas)
                  const getHoverClass = () => {
                    return "transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:brightness-110";
                  };

                  // Emoji e mensagem baseados no status
                  const getStatusInfo = () => {
                    if (assessor.achieved) return { emoji: "✅", message: "Meta atingida!" };
                    if (progressPercent >= 80) return { emoji: "🚀", message: "Quase lá!" };
                    if (progressPercent >= 50) return { emoji: "⏳", message: "Em progresso" };
                    return { emoji: "🔥", message: "Precisa acelerar!" };
                  };

                  const statusInfo = getStatusInfo();
                  
                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "flex flex-col items-center px-1 py-1 rounded text-center cursor-pointer",
                            colorClass,
                            getHoverClass()
                          )}
                        >
                          <span className={cn("font-medium", isTop2 ? "text-scale-8 lg:text-scale-9" : "text-scale-7 lg:text-scale-8")}>
                            {isTop2 && !assessor.achieved ? "🔥 " : ""}{assessor.name}
                          </span>
                          <span className={cn("font-black", isTop2 ? "text-scale-10 lg:text-scale-12 animate-pulse" : "text-scale-8 lg:text-scale-9")}>
                            {assessor.achieved 
                              ? "✓" 
                              : formatValue(assessor.remaining, isCurrency)
                            }
                          </span>
                        </div>
                      </TooltipTrigger>
                    <TooltipContent side="top" className="p-2">
                      <div className="text-center space-y-1">
                        <p className="font-bold text-sm flex items-center justify-center gap-1">
                          <span>{statusInfo.emoji}</span>
                          <span>{assessor.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{statusInfo.message}</p>
                        <div className="border-t border-border/50 pt-1 mt-1">
                          <p className="text-xs">
                            <span className="text-muted-foreground">Progresso: </span>
                            <span className="font-semibold">{Math.round(progressPercent)}%</span>
                          </p>
                          <p className="text-xs">
                            <span className="text-muted-foreground">Meta: </span>
                            <span className="font-medium">{formatValue(individualTarget, isCurrency)}</span>
                          </p>
                          <p className="text-xs">
                            <span className="text-muted-foreground">Realizado: </span>
                            <span className="font-medium text-green-500">{formatValue(assessor.contribution || 0, isCurrency)}</span>
                          </p>
                          {!assessor.achieved && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Falta: </span>
                              <span className="font-medium text-red-400">{formatValue(assessor.remaining, isCurrency)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              });
              })()}
            </div>
          </TooltipProvider>
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

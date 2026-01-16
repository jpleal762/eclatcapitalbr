import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { RotateCcw, Check } from "lucide-react";

interface FlipMetaTableProps {
  data: MetaSemanal[];
  realPercentage: number;
  selectedAssessor?: string;
  weekToMonthPercentage?: number;
  // Auto-flip props
  autoFlip?: boolean;
  autoFlipInterval?: number;
}

export function FlipMetaTable({
  data,
  realPercentage,
  selectedAssessor,
  weekToMonthPercentage,
  autoFlip = false,
  autoFlipInterval = 30000,
}: FlipMetaTableProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate remaining value for each KPI
  const getRemainingValue = (item: MetaSemanal): number => {
    if (item.realizedValue === undefined) return 0;
    const targetValue = typeof item.value === 'number' ? item.value : 0;
    const remaining = targetValue - item.realizedValue;
    return remaining > 0 ? remaining : 0;
  };

  // Check if goal was met
  const isGoalMet = (item: MetaSemanal): boolean => {
    if (item.realizedValue === undefined) return false;
    const targetValue = typeof item.value === 'number' ? item.value : 0;
    return item.realizedValue >= targetValue;
  };

  // Function to start auto-flip
  const startAutoFlip = useCallback(() => {
    if (!autoFlip) return;
    
    // Clear previous interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Create new interval
    intervalRef.current = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, autoFlipInterval);
  }, [autoFlip, autoFlipInterval]);

  // Start auto-flip when component mounts
  useEffect(() => {
    startAutoFlip();
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startAutoFlip]);

  // Handler for manual flip
  const handleFlip = () => {
    setIsFlipped(prev => !prev);
    
    // If auto-flip is active, restart the timer
    if (autoFlip) {
      startAutoFlip();
    }
  };

  return (
    <div 
      className="relative h-full cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front - Current MetaTable */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-responsive flex-shrink-0">
              <h3 className="text-responsive-sm font-semibold text-foreground">Meta Semanal Acumulada</h3>
              <div className="flex items-center gap-2">
                {selectedAssessor && selectedAssessor !== "all" && (
                  <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-primary/10 text-primary font-medium">
                    {selectedAssessor.split(" ").slice(0, 2).join(" ")}
                  </span>
                )}
                <div className="p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-responsive-sm text-responsive-xs font-medium text-muted-foreground">KPI</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Meta</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Realizado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-responsive-sm text-responsive-xs text-foreground">{item.label}</td>
                      <td className="py-responsive-sm text-responsive-xs text-right font-medium text-secondary-foreground">
                        {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                      </td>
                      <td className="py-responsive-sm text-responsive-xs text-right font-medium text-secondary-foreground">
                        {item.realizedValue !== undefined ? formatNumber(item.realizedValue, item.isCurrency) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-responsive border-t border-border flex items-center justify-between flex-shrink-0">
              <span className="text-responsive-base font-semibold text-primary">
                {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
              </span>
              <p className="text-responsive-xs text-muted-foreground italic">
                {selectedAssessor && selectedAssessor !== "all" ? `Metas individuais de ${selectedAssessor.split(" ")[0]}` : "Valores consolidados do escritório"}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Back - Remaining to Goal */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-responsive flex-shrink-0">
              <h3 className="text-responsive-sm font-semibold text-foreground">Falta para Meta Semanal</h3>
              <div className="flex items-center gap-2">
                {selectedAssessor && selectedAssessor !== "all" && (
                  <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-primary/10 text-primary font-medium">
                    {selectedAssessor.split(" ").slice(0, 2).join(" ")}
                  </span>
                )}
                <div className="p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-responsive-sm text-responsive-xs font-medium text-muted-foreground">KPI</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Meta</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Falta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const goalMet = isGoalMet(item);
                    const remaining = getRemainingValue(item);
                    
                    return (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-responsive-sm text-responsive-xs text-foreground">{item.label}</td>
                        <td className="py-responsive-sm text-responsive-xs text-right font-medium text-secondary-foreground">
                          {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                        </td>
                        <td className={`py-responsive-sm text-responsive-xs text-right font-medium ${
                          goalMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.realizedValue === undefined ? (
                            "-"
                          ) : goalMet ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Atingido</span>
                            </span>
                          ) : (
                            formatNumber(remaining, item.isCurrency)
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-responsive border-t border-border flex items-center justify-between flex-shrink-0">
              <span className="text-responsive-base font-semibold text-primary">
                {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
              </span>
              <p className="text-responsive-xs text-muted-foreground italic">
                Diferença entre meta e realizado
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

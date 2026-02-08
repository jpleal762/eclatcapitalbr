import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ICMCard } from "./ICMCard";
import { DashboardData } from "@/types/kpi";
import { RotateCcw, RefreshCw, CheckCircle, AlertTriangle, Sparkles, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HistoricalICMData {
  month: string;
  icmGeral: number;
}

interface FlipICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessors: string[];
  selectedAssessor: string;
  selectedMonth: string;
  months: string[];
  onAssessorChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  dashboardData: DashboardData;
  isFlipped?: boolean;
  isLocked?: boolean;
  historicalData?: HistoricalICMData[];
}

interface AnalysisResult {
  positivos: string[];
  negativos: string[];
  acoes48h: string[];
}

// Generate a hash of the data to detect changes
function generateDataHash(data: DashboardData, month: string, assessor: string): string {
  const key = `${month}-${assessor}-${data.icmGeral}-${data.ritmoIdeal}-${data.diasUteisRestantes}`;
  return key;
}

export function FlipICMCard({
  icmGeral,
  ritmoIdeal,
  diasUteisRestantes,
  assessors,
  selectedAssessor,
  selectedMonth,
  months,
  onAssessorChange,
  onMonthChange,
  dashboardData,
  isFlipped: controlledFlipped,
  isLocked = false,
  historicalData,
}: FlipICMCardProps) {
  // Manual flip offset for user-initiated flips
  const [manualFlipOffset, setManualFlipOffset] = useState(0);
  
  // Final flip state: controlled XOR manual offset
  const isFlipped = controlledFlipped !== undefined 
    ? (controlledFlipped !== (manualFlipOffset % 2 === 1))
    : (manualFlipOffset % 2 === 1);
    
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string>("");
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const displayAssessor = selectedAssessor === "all" 
    ? "Escritório" 
    : selectedAssessor.split(" ").slice(0, 2).join(" ");

  const fetchAnalysis = useCallback(async (forceRefresh = false) => {
    const currentHash = generateDataHash(dashboardData, selectedMonth, selectedAssessor);
    
    // Check cache first
    const cacheKey = `monthly-analysis-${currentHash}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
            setAnalysis(parsed.data);
            setLastHash(currentHash);
            setLastFetchTime(new Date(parsed.timestamp));
            return;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }
    }

    if (currentHash === lastHash && !forceRefresh) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-monthly-kpis', {
        body: {
          monthlyData: {
            icmGeral: dashboardData.icmGeral,
            ritmoIdeal: dashboardData.ritmoIdeal,
            diasUteisRestantes: dashboardData.diasUteisRestantes,
            totalDiasUteis: dashboardData.totalDiasUteis,
            diasUteisDecorridos: dashboardData.diasUteisDecorridos,
            gaugeKPIs: dashboardData.gaugeKPIs,
            metaSemanal: dashboardData.metaSemanal,
            assessorPerformance: dashboardData.assessorPerformance,
            selectedMonth,
            selectedAssessor,
          }
        }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      setLastHash(currentHash);
      setLastFetchTime(new Date());

      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar análise");
      toast.error("Erro ao carregar análise IA");
    } finally {
      setIsLoading(false);
    }
  }, [dashboardData, selectedMonth, selectedAssessor, lastHash]);

  // Fetch analysis when data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalysis();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchAnalysis]);

  const handleFlip = () => {
    setManualFlipOffset(prev => prev + 1);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchAnalysis(true);
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
        {/* Front - ICMCard */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full">
            <ICMCard
              icmGeral={icmGeral}
              ritmoIdeal={ritmoIdeal}
              diasUteisRestantes={diasUteisRestantes}
              assessors={assessors}
              selectedAssessor={selectedAssessor}
              selectedMonth={selectedMonth}
              months={months}
              onAssessorChange={onAssessorChange}
              onMonthChange={onMonthChange}
              isLocked={isLocked}
              historicalData={historicalData}
              dashboardData={dashboardData}
            />
            <div className="absolute top-2 right-2 p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity z-10">
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Back - AI Analysis */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden">
          <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-responsive-sm font-semibold text-foreground">Análise IA</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-responsive-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {displayAssessor}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <div className="p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0 max-h-full space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-4 w-24 mt-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : error ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-responsive-xs">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="mt-2"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : analysis ? (
                <>
                  {/* Positive Points */}
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-responsive-xs font-medium text-green-700 dark:text-green-400">Pontos Positivos</span>
                    </div>
                    <ul className="space-y-0">
                      {analysis.positivos.map((point, idx) => (
                        <li key={idx} className="text-responsive-xs text-foreground pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-green-600">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negative Points */}
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-responsive-xs font-medium text-orange-600 dark:text-orange-400">Pontos de Atenção</span>
                    </div>
                    <ul className="space-y-0">
                      {analysis.negativos.map((point, idx) => (
                        <li key={idx} className="text-responsive-xs text-foreground pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-orange-500">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 48h Actions */}
                  {analysis.acoes48h && analysis.acoes48h.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap className="w-3 h-3 text-blue-500" />
                        <span className="text-responsive-xs font-medium text-blue-600 dark:text-blue-400">Ações Imediatas (48h)</span>
                      </div>
                      <ul className="space-y-0">
                        {analysis.acoes48h.map((acao, idx) => (
                          <li key={idx} className="text-responsive-xs text-foreground pl-4 relative before:content-['→'] before:absolute before:left-1 before:text-blue-500">
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-responsive-xs">Carregando análise...</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-1 border-t border-border flex items-center justify-between flex-shrink-0">
              <span className="text-responsive-xs text-primary font-medium">
                {selectedMonth.toUpperCase()}
              </span>
              <p className="text-responsive-xs text-muted-foreground italic">
                {lastFetchTime 
                  ? `Análise: ${lastFetchTime.toLocaleDateString("pt-BR")} ${lastFetchTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Análise gerada por IA"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

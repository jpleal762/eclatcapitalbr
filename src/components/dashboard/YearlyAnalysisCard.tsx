import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { YearlyDashboardData } from "@/types/kpi";
import { useToast } from "@/hooks/use-toast";

interface YearlyAnalysisCardProps {
  yearlyData: YearlyDashboardData;
  selectedYear: number;
  selectedAssessor: string;
}

interface AnalysisResult {
  positivos: string[];
  negativos: string[];
}

function generateDataHash(data: YearlyDashboardData, year: number, assessor: string): string {
  const key = `${year}-${assessor}-${data.icmGeral}-${data.ritmoIdeal}-${data.gaugeKPIs.map(k => k.value).join(",")}`;
  return btoa(key).slice(0, 32);
}

export function YearlyAnalysisCard({ yearlyData, selectedYear, selectedAssessor }: YearlyAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const { toast } = useToast();

  const displayAssessor = selectedAssessor === "all" 
    ? "Escritório" 
    : selectedAssessor.split(" ").slice(0, 2).join(" ");

  const fetchAnalysis = useCallback(async (force = false) => {
    // Check if data has actually changed
    const currentHash = generateDataHash(yearlyData, selectedYear, selectedAssessor);
    
    // Try to load from cache first
    const cacheKey = `yearly-analysis-${currentHash}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setAnalysis(parsedCache);
          setLastHash(currentHash);
          return;
        } catch (e) {
          // Cache invalid, proceed to fetch
        }
      }
    }

    // Skip if same data and we already have analysis
    if (!force && lastHash === currentHash && analysis) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-yearly-kpis", {
        body: {
          yearlyData: {
            icmGeral: yearlyData.icmGeral,
            ritmoIdeal: yearlyData.ritmoIdeal,
            gaugeKPIs: yearlyData.gaugeKPIs,
            assessorPerformance: yearlyData.assessorPerformance,
            selectedYear,
            selectedAssessor,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.error.includes("Rate limit") || data.error.includes("429")) {
          toast({
            title: "Limite de requisições",
            description: "Aguarde alguns segundos e tente novamente.",
            variant: "destructive",
          });
        } else if (data.error.includes("402") || data.error.includes("Créditos")) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos à sua conta para continuar.",
            variant: "destructive",
          });
        }
        throw new Error(data.error);
      }

      setAnalysis(data);
      setLastHash(currentHash);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar análise");
    } finally {
      setIsLoading(false);
    }
  }, [yearlyData, selectedYear, selectedAssessor, lastHash, analysis, toast]);

  // Debounced effect to fetch analysis when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (yearlyData.gaugeKPIs.length > 0) {
        fetchAnalysis();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchAnalysis, yearlyData.gaugeKPIs.length]);

  return (
    <Card className="p-3 shadow-card border-l-4 border-l-chart-graphite">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[9px] font-semibold text-foreground">Análise</h3>
        <div className="flex items-center gap-1">
          <span className="text-[7px] text-muted-foreground">{displayAssessor}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => fetchAnalysis(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-2 w-2 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading && !analysis ? (
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
          <Skeleton className="h-2 w-5/6" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-2/3" />
        </div>
      ) : error && !analysis ? (
        <div className="text-center py-2">
          <p className="text-[7px] text-destructive mb-1">{error}</p>
          <Button variant="outline" size="sm" className="h-4 text-[6px]" onClick={() => fetchAnalysis(true)}>
            Tentar novamente
          </Button>
        </div>
      ) : analysis ? (
        <div className="space-y-2">
          {/* Positive Points */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="h-2 w-2 text-green-500" />
              <span className="text-[7px] font-medium text-foreground">Pontos Positivos</span>
            </div>
            <ul className="space-y-[3px]">
              {analysis.positivos.map((point, index) => (
                <li key={index} className="text-[6px] text-muted-foreground flex items-start gap-1">
                  <span className="text-green-500 mt-[1px]">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Negative Points */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-2 w-2 text-amber-500" />
              <span className="text-[7px] font-medium text-foreground">Pontos de Atenção</span>
            </div>
            <ul className="space-y-[3px]">
              {analysis.negativos.map((point, index) => (
                <li key={index} className="text-[6px] text-muted-foreground flex items-start gap-1">
                  <span className="text-amber-500 mt-[1px]">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-[7px] text-muted-foreground">
          Carregue dados para ver a análise
        </div>
      )}

      {/* Loading indicator when refreshing with existing data */}
      {isLoading && analysis && (
        <div className="mt-1 text-[6px] text-muted-foreground text-center">
          Atualizando análise...
        </div>
      )}
    </Card>
  );
}

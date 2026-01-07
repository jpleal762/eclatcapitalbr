import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { GaugeKPI } from "@/types/kpi";

interface YearlyMetaTableProps {
  gaugeKPIs: GaugeKPI[];
  selectedAssessor: string;
}

export function YearlyMetaTable({ gaugeKPIs, selectedAssessor }: YearlyMetaTableProps) {
  // Select key KPIs to show in summary table
  const summaryKPIs = gaugeKPIs.slice(0, 6);
  
  const displayAssessor = selectedAssessor === "all" 
    ? "Escritório" 
    : selectedAssessor.split(" ").slice(0, 2).join(" ");

  return (
    <Card className="p-responsive-lg shadow-card border-l-4 border-l-chart-graphite">
      <div className="flex justify-between items-center mb-responsive">
        <h3 className="text-responsive-lg font-semibold text-foreground">Resumo Anual</h3>
        <span className="text-responsive-xs text-muted-foreground">{displayAssessor}</span>
      </div>

      <div className="space-y-responsive">
        {summaryKPIs.map((kpi) => (
          <div key={kpi.label} className="flex items-center justify-between">
            <span className="text-responsive-xs text-muted-foreground truncate flex-1">
              {kpi.label}
            </span>
            <div className="flex items-center gap-responsive ml-2">
              <span className="text-responsive-xs font-medium text-foreground">
                {formatNumber(kpi.value, kpi.isCurrency)}
              </span>
              <div className="w-16">
                <div className="h-bar-responsive-sm w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-chart-graphite transition-all duration-500"
                    style={{ width: `${Math.min(kpi.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-responsive-3xs font-bold text-chart-graphite w-10 text-right">
                {kpi.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="mt-responsive pt-responsive border-t border-border">
        <div className="flex justify-between items-center text-responsive-xs">
          <span className="text-muted-foreground">Meta vs Realizado</span>
          <span className="font-bold text-chart-graphite">
            {summaryKPIs.length > 0 
              ? Math.round(summaryKPIs.reduce((sum, k) => sum + k.percentage, 0) / summaryKPIs.length)
              : 0}% médio
          </span>
        </div>
      </div>
    </Card>
  );
}

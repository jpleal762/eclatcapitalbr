import { Card } from "@/components/ui/card";
import { AssessorPerformance } from "@/types/kpi";

interface AssessorChartProps {
  data: AssessorPerformance[];
}

export function AssessorChart({ data }: AssessorChartProps) {
  const maxPercentage = Math.max(...data.map(d => Math.max(d.geralPercentage, d.semanaPercentage)), 100);

  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">ICM Geral por Assessor</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">% Geral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-chart-dark" />
            <span className="text-muted-foreground">% Semana Acumulado</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((assessor, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24 truncate">
                {assessor.name}
              </span>
              <div className="flex-1 relative">
                {/* Geral bar */}
                <div className="h-4 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary rounded transition-all duration-500"
                    style={{ width: `${(assessor.geralPercentage / maxPercentage) * 100}%` }}
                  />
                </div>
                {/* Semana bar (overlay) */}
                <div 
                  className="absolute top-0 left-0 h-4"
                  style={{ width: `${(assessor.semanaPercentage / maxPercentage) * 100}%` }}
                >
                  <div className="h-full bg-chart-dark rounded opacity-80" />
                </div>
              </div>
              <div className="flex gap-2 w-20 justify-end">
                <span className="text-xs font-medium text-primary">{assessor.geralPercentage}%</span>
                <span className="text-xs font-medium text-muted-foreground">{assessor.semanaPercentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

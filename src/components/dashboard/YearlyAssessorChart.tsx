import { Card } from "@/components/ui/card";
import { AssessorPerformance, KPIStatusIcon } from "@/types/kpi";
import { Trophy, Medal, Award, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getKPIStatusIcon } from "@/lib/kpiUtils";

interface YearlyAssessorChartProps {
  data: AssessorPerformance[];
  ritmoIdeal: number;
}

function StatusIcon({ icon }: { icon: KPIStatusIcon }) {
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />;
    case "CLOCK":
      return <Clock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />;
    case "YELLOW_ALERT":
      return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />;
    case "RED_ALERT":
      return <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />;
    default:
      return null;
  }
}

export function YearlyAssessorChart({ data, ritmoIdeal }: YearlyAssessorChartProps) {
  const sortedData = [...data].sort((a, b) => b.geralPercentage - a.geralPercentage);
  const topThree = sortedData.slice(0, 3);
  const others = sortedData.slice(3);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 shadow-card border-l-4 border-l-chart-graphite">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Ranking Anual Assessores</h3>
      
      {/* Top 3 */}
      <div className="space-y-3 mb-4">
        {topThree.map((assessor, index) => (
          <div key={assessor.fullName || assessor.name} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
                  <span className="text-sm font-medium text-foreground truncate">
                    {assessor.name}
                  </span>
                </div>
                <div className="text-right ml-2">
                  <span className="text-sm font-bold text-chart-graphite">
                    {assessor.geralPercentage}%
                  </span>
                  <span className="text-xs font-medium text-gray-500 block">
                    {assessor.semanaPercentage}%
                  </span>
                </div>
              </div>
              {/* Barra ICM Geral */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-graphite transition-all duration-500"
                  style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                />
              </div>
              {/* Barra ICM Semanal (cinza) */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-gray-500 transition-all duration-500"
                  style={{ width: `${Math.min(assessor.semanaPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Others */}
      {others.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          {others.map((assessor, index) => (
            <div key={assessor.fullName || assessor.name} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 text-center text-sm text-muted-foreground">
                {index + 4}º
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
                    <span className="text-sm text-muted-foreground truncate">
                      {assessor.name}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {assessor.geralPercentage}%
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {assessor.semanaPercentage}%
                    </span>
                  </div>
                </div>
                {/* Barra ICM Geral */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-chart-graphite-light transition-all duration-500"
                    style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                  />
                </div>
                {/* Barra ICM Semanal (cinza) */}
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full bg-gray-400 transition-all duration-500"
                    style={{ width: `${Math.min(assessor.semanaPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

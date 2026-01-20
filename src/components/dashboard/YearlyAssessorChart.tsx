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
      return <CheckCircle className="icon-responsive-sm text-green-500 flex-shrink-0" />;
    case "CLOCK":
      return <Clock className="icon-responsive-sm text-blue-500 flex-shrink-0" />;
    case "YELLOW_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-eclat-gold flex-shrink-0" />;
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-red-500 flex-shrink-0" />;
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
        return <Trophy className="icon-responsive text-eclat-gold" />;
      case 1:
        return <Medal className="icon-responsive text-gray-400" />;
      case 2:
        return <Award className="icon-responsive text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-responsive-lg shadow-card border-l-4 border-l-chart-graphite">
      <h3 className="text-responsive-lg font-semibold mb-responsive text-foreground">Ranking Anual Assessores</h3>
      
      {/* Top 3 */}
      <div className="space-y-responsive mb-responsive">
        {topThree.map((assessor, index) => (
          <div key={assessor.fullName || assessor.name} className="flex items-center gap-responsive">
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-responsive-sm">
                <div className="flex items-center gap-responsive-sm">
                  <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
                  <span className="text-responsive-sm font-medium text-foreground truncate">
                    {assessor.name}
                  </span>
                </div>
                <div className="text-right ml-2">
                  <span className="text-responsive-sm font-bold text-chart-graphite">
                    {assessor.geralPercentage}%
                  </span>
                  <span className="text-responsive-xs font-medium text-gray-500 block">
                    {assessor.semanaPercentage}%
                  </span>
                </div>
              </div>
              {/* Barra ICM Geral */}
              <div className="h-bar-responsive w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-graphite transition-all duration-500"
                  style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                />
              </div>
              {/* Barra ICM Semanal (cinza) */}
              <div className="h-bar-responsive-sm w-full rounded-full bg-muted overflow-hidden mt-responsive-sm">
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
        <div className="border-t border-border pt-responsive space-y-responsive-sm">
          {others.map((assessor, index) => (
            <div key={assessor.fullName || assessor.name} className="flex items-center gap-responsive">
              <div className="flex-shrink-0 w-8 text-center text-responsive-sm text-muted-foreground">
                {index + 4}º
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-responsive-sm">
                    <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
                    <span className="text-responsive-xs text-muted-foreground truncate">
                      {assessor.name}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-responsive-xs font-medium text-muted-foreground">
                      {assessor.geralPercentage}%
                    </span>
                    <span className="text-responsive-3xs text-gray-500 block">
                      {assessor.semanaPercentage}%
                    </span>
                  </div>
                </div>
                {/* Barra ICM Geral */}
                <div className="h-bar-responsive-sm w-full rounded-full bg-muted overflow-hidden mt-responsive-sm">
                  <div
                    className="h-full rounded-full bg-chart-graphite-light transition-all duration-500"
                    style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                  />
                </div>
                {/* Barra ICM Semanal (cinza) */}
                <div className="h-bar-responsive-sm w-full rounded-full bg-muted overflow-hidden mt-responsive-sm">
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

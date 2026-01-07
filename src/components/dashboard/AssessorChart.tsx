import { Card } from "@/components/ui/card";
import { AssessorPerformance, KPIStatusIcon } from "@/types/kpi";
import { getKPIStatusIcon } from "@/lib/kpiUtils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
interface AssessorChartProps {
  data: AssessorPerformance[];
  ritmoIdeal: number;
  isTvMode?: boolean;
}
function StatusIcon({
  icon,
  isTvMode = false
}: {
  icon: KPIStatusIcon;
  isTvMode?: boolean;
}) {
  const iconClass = isTvMode ? "h-4 w-4" : "h-3.5 w-3.5";
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className={`${iconClass} text-green-500 flex-shrink-0`} />;
    case "CLOCK":
      return <Clock className={`${iconClass} text-blue-500 flex-shrink-0`} />;
    case "YELLOW_ALERT":
      return <AlertTriangle className={`${iconClass} text-yellow-500 flex-shrink-0`} />;
    case "RED_ALERT":
      return <AlertTriangle className={`${iconClass} text-red-500 flex-shrink-0`} />;
    default:
      return null;
  }
}
export function AssessorChart({
  data,
  ritmoIdeal,
  isTvMode = false
}: AssessorChartProps) {
  // Filter out "Socios" from ranking
  const filteredData = data.filter(assessor => assessor.name !== "Socios");
  const getMedalEmoji = (index: number): string => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };
  return <Card className="p-3 shadow-card h-full flex flex-col overflow-hidden">
      <h3 className={`${isTvMode ? 'text-base' : 'text-sm'} font-semibold mb-2 text-foreground flex items-center gap-2 flex-shrink-0`}>
        ICM Geral por Assessor
      </h3>
      
      <div className="flex-1 overflow-auto min-h-0 space-y-1">
        {filteredData.map((assessor, index) => <div key={assessor.name} className={`flex items-center gap-1.5 p-1 rounded-md transition-all hover:translate-x-1 ${index < 3 ? 'bg-muted/50' : 'bg-background'}`}>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} isTvMode={isTvMode} />
                <p className={`${isTvMode ? 'text-xs' : 'text-[10px]'} font-medium text-foreground truncate`}>{assessor.name}</p>
              </div>
              {/* Barra ICM Geral (amarela) com marcador de Ritmo Ideal */}
              <div className={`relative w-full ${isTvMode ? 'h-1.5' : 'h-1'} bg-muted rounded-full overflow-visible mt-0.5`}>
                <div className="h-full rounded-full transition-all duration-500 bg-yellow-500" style={{
                  width: `${Math.min(assessor.geralPercentage, 100)}%`
                }} />
                {/* Marcador do Ritmo Ideal - linha vertical */}
                <div 
                  className="absolute top-0 w-0.5 h-full bg-primary"
                  style={{ left: `${Math.min(ritmoIdeal, 100)}%` }}
                />
              </div>
              {/* Barra ICM Semanal (cinza) */}
              <div className={`w-full ${isTvMode ? 'h-1.5' : 'h-1'} bg-muted rounded-full overflow-hidden mt-0.5`}>
                <div className="h-full rounded-full transition-all duration-500 bg-gray-500" style={{
                  width: `${Math.min(assessor.semanaPercentage, 100)}%`
                }} />
              </div>
            </div>
            
            <div className="text-right">
              <span className={`${isTvMode ? 'text-sm' : 'text-xs'} font-bold text-yellow-600`}>
                {assessor.geralPercentage}%
              </span>
              <span className={`${isTvMode ? 'text-xs' : 'text-[10px]'} font-medium text-gray-500 block`}>
                {assessor.semanaPercentage}%
              </span>
            </div>
          </div>)}
      </div>

      <div className="mt-auto pt-2 border-t border-border text-center flex-shrink-0">
        <p className={`${isTvMode ? 'text-xs' : 'text-[9px]'} text-muted-foreground italic`}>
          Ranking de assessores para o período
        </p>
      </div>
    </Card>;
}
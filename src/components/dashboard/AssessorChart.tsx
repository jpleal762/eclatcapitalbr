import { Card } from "@/components/ui/card";
import { AssessorPerformance, KPIStatusIcon } from "@/types/kpi";
import { getKPIStatusIcon } from "@/lib/kpiUtils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface AssessorChartProps {
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

export function AssessorChart({
  data,
  ritmoIdeal
}: AssessorChartProps) {
  // Filter out "Socios" from ranking
  const filteredData = data.filter(assessor => assessor.name !== "Socios");
  const getMedalEmoji = (index: number): string => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };
  return <Card className="p-4 shadow-card">
      <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
        <span>
      </span> ICM% por Assessor
      </h3>
      
      <div className="space-y-1.5">
        {filteredData.map((assessor, index) => <div key={assessor.name} className={`flex items-center gap-2 p-1.5 rounded-md transition-all hover:translate-x-1 ${index < 3 ? 'bg-muted/50' : 'bg-background'}`}>
            <div className="w-6 text-center font-bold text-sm">
              {getMedalEmoji(index) || `#${index + 1}`}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
                <p className="text-xs font-medium text-foreground truncate">{assessor.name}</p>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                <div className="h-full rounded-full transition-all duration-500 bg-yellow-500" style={{
              width: `${Math.min(assessor.geralPercentage, 100)}%`
            }} />
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-sm font-bold text-yellow-600">
                {assessor.geralPercentage}%
              </span>
            </div>
          </div>)}
      </div>

      <div className="mt-3 pt-2 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground italic">
          Ranking de todos os assessores para o mês selecionado
        </p>
      </div>
    </Card>;
}
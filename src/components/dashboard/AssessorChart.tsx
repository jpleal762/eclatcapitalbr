import { Card } from "@/components/ui/card";
import { AssessorPerformance, KPIStatusIcon } from "@/types/kpi";
import { getKPIStatusIcon } from "@/lib/kpiUtils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className="icon-responsive-sm text-green-500 flex-shrink-0" />;
    case "CLOCK":
      return <Clock className="icon-responsive-sm text-blue-500 flex-shrink-0" />;
    case "YELLOW_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-yellow-500 flex-shrink-0" />;
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-red-500 flex-shrink-0" />;
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
  
  return (
    <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden">
      <h3 className="text-responsive-sm font-semibold mb-responsive text-foreground flex items-center gap-responsive-sm flex-shrink-0">
        ICM Geral por Assessor
      </h3>
      
      <div className="flex-1 overflow-hidden min-h-0 space-y-responsive-sm">
        {filteredData.map((assessor, index) => {
          const difference = assessor.geralPercentage - ritmoIdeal;
          const differenceText = difference > 0 ? `+${difference}%` : `${difference}%`;
          const differenceColor = difference >= 0 ? "text-green-600" : "text-red-600";
          
          return (
            <div key={assessor.name} className={`flex items-center gap-responsive-sm p-responsive-sm rounded-md transition-all hover:translate-x-1 ${index < 3 ? 'bg-muted/50' : 'bg-background'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-responsive-sm">
                  <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} isTvMode={isTvMode} />
                  <p className="text-responsive-xs font-medium text-foreground truncate">{assessor.name}</p>
                </div>
                {/* Barra ICM Geral (amarela) com marcador de Ritmo Ideal */}
                <div className="relative w-full h-bar-responsive-sm bg-muted rounded-full overflow-visible mt-responsive-sm">
                  <div className="h-full rounded-full transition-all duration-500 bg-yellow-500" style={{
                    width: `${Math.min(assessor.geralPercentage, 100)}%`
                  }} />
                  {/* Marcador do Ritmo Ideal - linha vertical com relógio e tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="absolute top-1/2 flex items-center justify-center cursor-pointer transition-all duration-500 ease-out"
                          style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary shadow-md">
                            <Clock className="w-2 h-2 text-primary-foreground" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="text-responsive-xs text-muted-foreground">Ritmo Ideal: {ritmoIdeal}%</p>
                          <p className={`text-responsive-sm font-bold ${differenceColor}`}>{differenceText}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* Barra ICM Semanal (cinza) */}
                <div className="w-full h-bar-responsive-sm bg-muted rounded-full overflow-hidden mt-responsive-sm">
                  <div className="h-full rounded-full transition-all duration-500 bg-gray-500" style={{
                    width: `${Math.min(assessor.semanaPercentage, 100)}%`
                  }} />
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-responsive-xs font-bold text-yellow-600">
                  {assessor.geralPercentage}%
                </span>
                <span className="text-responsive-3xs font-medium text-gray-500 block">
                  {assessor.semanaPercentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-responsive border-t border-border text-center flex-shrink-0">
        <p className="text-responsive-3xs text-muted-foreground italic">
          Ranking de assessores para o período
        </p>
      </div>
    </Card>
  );
}

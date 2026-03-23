import React from "react";
import { Card } from "@/components/ui/card";
import { AssessorPerformance, KPIStatusIcon } from "@/types/kpi";
import { getKPIStatusIcon } from "@/lib/kpiUtils";
import { AlertTriangle, Clock, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AssessorChartProps {
  data: AssessorPerformance[];
  ritmoIdeal: number;
  selectedAssessor?: string;
  agendadasData?: Array<{ name: string; value: number }>;
}

// Function to get clock style based on performance
const getClockStyle = (currentValue: number, idealValue: number) => {
  const percentageBelowIdeal = idealValue > 0 ? ((idealValue - currentValue) / idealValue) * 100 : 0;
  
  if (currentValue >= idealValue) {
    return { bgColor: 'bg-green-500', animate: false };
  } else if (percentageBelowIdeal > 50) {
    return { bgColor: 'bg-red-gradient', animate: true };
  } else {
    return { bgColor: 'bg-eclat-gradient', animate: true };
  }
};

function StatusIcon({ icon }: { icon: KPIStatusIcon }) {
  switch (icon) {
    case "TROPHY":
      return <Trophy className="icon-responsive-sm text-eclat-gold flex-shrink-0" />;
    case "GREEN_CHECK":
      return <Clock className="icon-responsive-sm text-green-500 flex-shrink-0" />;
    case "CLOCK":
      return <Clock className="icon-responsive-sm text-blue-500 flex-shrink-0" />;
    case "YELLOW_ALERT":
      return null;
    case "ORANGE_ALERT":
      return null;
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-red-500 flex-shrink-0" />;
    default:
      return null;
  }
}

export function AssessorChart({
  data,
  ritmoIdeal,
  selectedAssessor = "all",
  agendadasData = []
}: AssessorChartProps) {
  const filteredData = React.useMemo(() => {
    let filtered = data.filter(assessor => assessor.name !== "Socios");
    if (selectedAssessor && selectedAssessor !== "all") {
      filtered = filtered.filter(assessor => assessor.fullName === selectedAssessor);
    }
    return filtered;
  }, [data, selectedAssessor]);

  const topAgendador = React.useMemo(() => {
    if (!agendadasData || agendadasData.length === 0) return null;
    const maxAgendadas = Math.max(...agendadasData.map(a => a.value));
    if (maxAgendadas < 4) return null;
    const topAssessor = agendadasData.find(a => a.value === maxAgendadas);
    return topAssessor?.name || null;
  }, [agendadasData]);
  
  const isSingleAssessor = filteredData.length === 1;
  
  const renderAssessor = (assessor: AssessorPerformance, index: number) => {
    const difference = assessor.geralPercentage - ritmoIdeal;
    const differenceText = difference > 0 ? `+${difference}%` : `${difference}%`;
    const differenceColor = difference >= 0 ? "text-green-600" : "text-red-600";
    const clockStyle = getClockStyle(assessor.geralPercentage, ritmoIdeal);
    
    const statusIcon = getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal);
    const isRedAlert = statusIcon === "RED_ALERT";
    const isOrangeAlert = statusIcon === "ORANGE_ALERT";
    const isOnRhythm = assessor.geralPercentage >= ritmoIdeal;

    // Gap: how many pp below target (for those behind)
    const gapPP = Math.max(ritmoIdeal - assessor.geralPercentage, 0);
    
    const bgClass = isRedAlert
      ? 'bg-red-500/15 border border-red-500/40'
      : isOrangeAlert
      ? 'bg-orange-500/10 border border-orange-500/30'
      : isOnRhythm
      ? 'bg-green-500/8 border border-green-500/40'
      : index < 3 ? 'bg-muted/50 border border-transparent' : 'bg-background border border-transparent';
    
    const nameClass = isRedAlert
      ? 'text-red-600 dark:text-red-400 font-bold'
      : isOrangeAlert
      ? 'text-orange-600 dark:text-orange-400 font-semibold'
      : isOnRhythm
      ? 'text-green-600 dark:text-green-400'
      : 'text-foreground';
    
    const percentClass = isRedAlert
      ? 'text-red-600'
      : isOnRhythm
      ? 'text-green-600 dark:text-green-400'
      : 'text-eclat-gold';
    
    return (
      <div key={assessor.name} className={`flex items-center gap-0.5 p-0.5 rounded-md transition-all hover:translate-x-0.5 ${bgClass} ${isRedAlert ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-0.5">
            <StatusIcon icon={statusIcon} />
            <p className={`text-responsive-2xs font-semibold truncate uppercase tracking-wide ${nameClass}`}>{assessor.name}</p>
            {topAgendador === assessor.name && (
              <Trophy className="icon-responsive-sm text-eclat-gold animate-trophy-celebrate flex-shrink-0" />
            )}
          </div>
          {/* Barra ICM Geral com marcador de Ritmo Ideal */}
          <div className="relative w-full h-[9px] bg-muted rounded-full overflow-visible mt-[1px]">
            <div className="h-full rounded-l-full transition-all duration-500 bg-eclat-gradient-horizontal" style={{
              width: `${Math.min(assessor.geralPercentage, 100)}%`
            }} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute flex flex-col items-center cursor-pointer transition-all duration-500 ease-out"
                    style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)', top: '-4px' }}
                  >
                    <div className={`flex items-center justify-center w-1.5 h-1.5 rounded-full shadow-lg border border-white ${clockStyle.bgColor} ${clockStyle.animate ? 'animate-pulse-clock' : ''}`}>
                      <Clock className="w-[3px] h-[3px] text-white" />
                    </div>
                    <div className={`w-px h-[3px] ${clockStyle.bgColor}`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="text-responsive-2xs text-muted-foreground">Ritmo Ideal: {ritmoIdeal}%</p>
                    <p className="text-responsive-sm font-bold" style={{ color: differenceColor === 'text-green-600' ? '#16a34a' : '#dc2626' }}>{differenceText}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0 flex flex-col items-end">
          <span className={`text-scale-7 font-bold leading-none ${percentClass}`}>
            {assessor.geralPercentage}%
          </span>
          {/* Gap abaixo do ritmo */}
          {!isOnRhythm && gapPP > 0 && (
            <span className={`text-[9px] font-semibold leading-none mt-0.5 ${
              isRedAlert ? 'text-red-500' : isOrangeAlert ? 'text-orange-500' : 'text-muted-foreground'
            }`}>
              -{gapPP}pp
            </span>
          )}
        </div>
      </div>
    );
  };
  
  if (isSingleAssessor) {
    return (
      <Card className="p-1 shadow-card h-full flex flex-col overflow-hidden">
        <h3 className="text-responsive-sm font-semibold mb-0.5 text-foreground flex items-center gap-0.5 flex-shrink-0">
          ICM Geral - {filteredData[0].name} <Trophy className="icon-responsive text-eclat-gold" />
        </h3>
        <div className="flex-1 flex items-start justify-center p-2">
          <div className="w-full max-w-md">
            {renderAssessor(filteredData[0], 0)}
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-1 shadow-card h-full flex flex-col overflow-hidden">
      <h3 className="text-responsive-sm font-semibold mb-0.5 text-foreground flex items-center gap-0.5 flex-shrink-0">
        ICM Geral por Assessor <Trophy className="icon-responsive text-eclat-gold" />
      </h3>
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-[1px] overflow-hidden">
        {filteredData.map((assessor, index) => renderAssessor(assessor, index))}
      </div>
    </Card>
  );
}

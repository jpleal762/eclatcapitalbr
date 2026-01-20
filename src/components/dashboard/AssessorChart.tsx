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
      return <AlertTriangle className="icon-responsive-sm text-eclat-gold flex-shrink-0" />;
    case "ORANGE_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-orange-500 flex-shrink-0" />;
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
  // Filter out "Socios" from ranking and apply assessor filter
  const filteredData = React.useMemo(() => {
    let filtered = data.filter(assessor => assessor.name !== "Socios");
    
    // Se um assessor específico foi selecionado, mostrar apenas ele
    // Usar fullName para corresponder ao valor do filtro
    if (selectedAssessor && selectedAssessor !== "all") {
      filtered = filtered.filter(assessor => assessor.fullName === selectedAssessor);
    }
    
    return filtered;
  }, [data, selectedAssessor]);

  // Calcular quem é o top agendador (maior valor, >= 4)
  const topAgendador = React.useMemo(() => {
    if (!agendadasData || agendadasData.length === 0) return null;
    
    const maxAgendadas = Math.max(...agendadasData.map(a => a.value));
    
    // Só mostrar troféu se >= 4
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
    
    return (
      <div key={assessor.name} className={`flex items-center gap-1 p-1 rounded-md transition-all hover:translate-x-0.5 ${index < 3 ? 'bg-muted/50' : 'bg-background'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
            <p className="text-responsive-3xs font-medium text-foreground truncate">{assessor.name}</p>
            {/* Troféu animado para top agendador */}
            {topAgendador === assessor.name && (
              <Trophy className="icon-responsive-sm text-eclat-gold animate-trophy-celebrate flex-shrink-0" />
            )}
          </div>
          {/* Barra ICM Geral (amarela) com marcador de Ritmo Ideal */}
          <div className="relative w-full h-1.5 bg-muted rounded-full overflow-visible mt-0.5">
            <div className="h-full rounded-l-full transition-all duration-500 bg-eclat-gradient-horizontal" style={{
              width: `${Math.min(assessor.geralPercentage, 100)}%`
            }} />
            {/* Marcador do Ritmo Ideal - Clock com cores condicionais */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute flex flex-col items-center cursor-pointer transition-all duration-500 ease-out"
                    style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)', top: '-8px' }}
                  >
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full shadow-lg border border-white ${clockStyle.bgColor} ${clockStyle.animate ? 'animate-pulse-clock' : ''}`}>
                      <Clock className="w-1.5 h-1.5 text-white" />
                    </div>
                    {/* Linha conectora com cor condicional */}
                    <div className={`w-px h-1.5 ${clockStyle.bgColor}`} />
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
          {/* Barra ICM Semanal (cinza) */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-0.5">
            <div className="h-full rounded-l-full transition-all duration-500 bg-gray-500" style={{
              width: `${Math.min(assessor.semanaPercentage, 100)}%`
            }} />
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <span className="text-responsive-3xs font-bold text-eclat-gold">
            {assessor.geralPercentage}%
          </span>
          <span className="text-[9px] font-medium text-gray-500 block leading-tight">
            {assessor.semanaPercentage}%
          </span>
        </div>
      </div>
    );
  };
  
  // Layout para assessor único (centralizado e maior)
  if (isSingleAssessor) {
    return (
      <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden">
        <h3 className="text-responsive-xs font-semibold mb-1 text-foreground flex items-center gap-1 flex-shrink-0">
          ICM Geral - {filteredData[0].name}
        </h3>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {renderAssessor(filteredData[0], 0)}
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden">
      <h3 className="text-responsive-xs font-semibold mb-1 text-foreground flex items-center gap-1 flex-shrink-0">
        ICM Geral por Assessor
      </h3>
      
      {/* Coluna única com distribuição vertical */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {filteredData.map((assessor, index) => renderAssessor(assessor, index))}
      </div>
    </Card>
  );
}

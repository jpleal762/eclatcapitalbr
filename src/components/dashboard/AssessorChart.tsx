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
      return null; // Sem ícone para alerta amarelo
    case "ORANGE_ALERT":
      return null; // Sem ícone para alerta laranja
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
      <div key={assessor.name} className={`flex items-center gap-0.5 p-0.5 rounded-md transition-all hover:translate-x-0.5 ${index < 3 ? 'bg-muted/50' : 'bg-background'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-0.5">
            <StatusIcon icon={getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal)} />
            <p className="text-responsive-2xs font-semibold text-foreground truncate uppercase tracking-wide">{assessor.name}</p>
            {/* Troféu animado para top agendador */}
            {topAgendador === assessor.name && (
              <Trophy className="icon-responsive-sm text-eclat-gold animate-trophy-celebrate flex-shrink-0" />
            )}
          </div>
          {/* Barra ICM Geral (amarela) com marcador de Ritmo Ideal */}
          <div className="relative w-full h-[9px] bg-muted rounded-full overflow-visible mt-[1px]">
            <div className="h-full rounded-l-full transition-all duration-500 bg-eclat-gradient-horizontal" style={{
              width: `${Math.min(assessor.geralPercentage, 100)}%`
            }} />
            {/* Marcador do Ritmo Ideal - Clock com cores condicionais */}
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
                    {/* Linha conectora com cor condicional */}
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
{/* Barra ICM Semanal (azul degradê) */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-[1px]">
            <div className="h-full rounded-l-full transition-all duration-500 bg-blue-gradient-horizontal" style={{
              width: `${Math.min(assessor.semanaPercentage, 100)}%`
            }} />
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <span className="text-scale-7 font-bold text-eclat-gold">
            {assessor.geralPercentage}%
          </span>
          <span className="text-scale-7 font-medium text-blue-500 block leading-tight">
            {assessor.semanaPercentage}%
          </span>
        </div>
      </div>
    );
  };
  
  // Layout para assessor único (centralizado e maior)
  if (isSingleAssessor) {
    return (
      <Card className="p-1 shadow-card h-full flex flex-col overflow-hidden">
       <h3 className="text-responsive-sm font-semibold mb-0.5 text-foreground flex items-center gap-0.5 flex-shrink-0">
          <Trophy className="icon-responsive-sm text-eclat-gold" /> ICM Geral - {filteredData[0].name}
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
        <Trophy className="icon-responsive-sm text-eclat-gold" /> ICM Geral por Assessor
      </h3>
      
      {/* Coluna única com distribuição vertical - justify-between para espaçar, gap-0.5 mínimo */}
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-[1px] overflow-hidden">
        {filteredData.map((assessor, index) => renderAssessor(assessor, index))}
      </div>
    </Card>
  );
}

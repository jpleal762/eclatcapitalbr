import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GaugeChart } from "./GaugeChart";
import { formatNumber } from "@/lib/kpiUtils";
import { RotateCcw } from "lucide-react";
import type { AssessorRemainingItem } from "./GaugeChart";

export interface FlipBackData {
  name: string;
  value: number;
}

interface FlipGaugeChartProps {
  // Props do GaugeChart original
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  warning?: boolean;
  size?: "sm" | "md" | "lg";
  showRemaining?: boolean;
  ritmoIdeal?: number;
  assessorRemainingData?: AssessorRemainingItem[];
  showAssessorList?: boolean;
  // Additional value for segmented bar visualization (e.g., Receita Empilhada)
  additionalValue?: number;
  // Peso do KPI no cálculo do ICM
  weight?: number;
  // Props para o verso
  backTitle: string;
  backData: FlipBackData[];
  // Controlled flip state
  isFlipped?: boolean;
  // Modo compacto - reduz escala do gauge
  compact?: boolean;
}

export function FlipGaugeChart({
  label,
  value,
  target,
  percentage,
  isCurrency = false,
  warning = false,
  size = "md",
  showRemaining = false,
  ritmoIdeal,
  assessorRemainingData,
  showAssessorList = false,
  additionalValue,
  weight,
  backTitle,
  backData,
  isFlipped: controlledFlipped,
  compact = false,
}: FlipGaugeChartProps) {
  // Manual flip offset for user-initiated flips
  const [manualFlipOffset, setManualFlipOffset] = useState(0);
  
  // Final flip state: controlled XOR manual offset
  const isFlipped = controlledFlipped !== undefined 
    ? (controlledFlipped !== (manualFlipOffset % 2 === 1))
    : (manualFlipOffset % 2 === 1);

  // Handler para flip manual
  const handleFlip = () => {
    setManualFlipOffset(prev => prev + 1);
  };

  return (
    <div 
      className="relative h-full cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente - Gauge Chart */}
        <div className="absolute inset-0 backface-hidden overflow-hidden flex items-center justify-center">
          <div className="relative h-full w-full">
            <GaugeChart
              label={label}
              value={value}
              target={target}
              percentage={percentage}
              isCurrency={isCurrency}
              warning={warning}
              size={size}
              showRemaining={showRemaining}
              ritmoIdeal={ritmoIdeal}
              assessorRemainingData={assessorRemainingData}
              showAssessorList={showAssessorList}
              additionalValue={additionalValue}
              weight={weight}
              compact={compact}
            />
            {/* Indicador de flip */}
            <div className="absolute top-1 right-1 p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Verso - Lista de Receita Empilhada */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden">
          <Card className="h-full p-1 flex flex-col shadow-card">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="font-semibold text-responsive-2xs text-foreground">
                {backTitle}
              </h4>
              <div className="p-[1px] rounded-full bg-muted/50">
                <RotateCcw className="icon-responsive-sm text-muted-foreground" />
              </div>
            </div>
            
            {/* Lista de assessores */}
            <div className="flex-1 min-h-0">
              <div className="space-y-[1px]">
                {backData.length > 0 ? (
                  backData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-responsive-2xs py-0"
                    >
                      <span className="font-medium text-foreground truncate max-w-[55%]">
                        {item.name}
                      </span>
                      <span className="font-medium text-secondary-foreground">
                        {formatNumber(item.value, true)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-responsive-2xs text-muted-foreground italic text-center py-0.5">
                    Sem dados
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GaugeChart } from "./GaugeChart";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";
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
  statusIcon?: KPIStatusIcon;
  showRemaining?: boolean;
  ritmoIdeal?: number;
  assessorRemainingData?: AssessorRemainingItem[];
  showAssessorList?: boolean;
  // Additional value for segmented bar visualization (e.g., Receita Empilhada)
  additionalValue?: number;
  // Props para o verso
  backTitle: string;
  backData: FlipBackData[];
}

export function FlipGaugeChart({
  label,
  value,
  target,
  percentage,
  isCurrency = false,
  warning = false,
  size = "md",
  statusIcon,
  showRemaining = false,
  ritmoIdeal,
  assessorRemainingData,
  showAssessorList = false,
  additionalValue,
  backTitle,
  backData,
}: FlipGaugeChartProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full">
            <GaugeChart
              label={label}
              value={value}
              target={target}
              percentage={percentage}
              isCurrency={isCurrency}
              warning={warning}
              size={size}
              statusIcon={statusIcon}
              showRemaining={showRemaining}
              ritmoIdeal={ritmoIdeal}
              assessorRemainingData={assessorRemainingData}
              showAssessorList={showAssessorList}
              additionalValue={additionalValue}
            />
            {/* Indicador de flip */}
            <div className="absolute top-1 right-1 p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Verso - Lista de Receita Empilhada */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full p-2 flex flex-col shadow-card">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[10px] text-foreground">
                {backTitle}
              </h4>
              <div className="p-0.5 rounded-full bg-muted/50">
                <RotateCcw className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </div>
            
            {/* Lista de assessores */}
            <div className="flex-1 min-h-0">
              <div className="space-y-0.5">
                {backData.length > 0 ? (
                  backData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[9px] py-0"
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
                  <p className="text-[9px] text-muted-foreground italic text-center py-1">
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

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
  backTitle,
  backData,
}: FlipGaugeChartProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Calculate total for back
  const backTotal = backData.reduce((sum, item) => sum + item.value, 0);

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
            />
            {/* Indicador de flip */}
            <div className="absolute top-1 right-1 p-1 rounded-full bg-muted/50 opacity-50 hover:opacity-100 transition-opacity">
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Verso - Lista de Receita Empilhada */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full p-responsive flex flex-col shadow-card">
            <div className="flex items-center justify-between mb-responsive">
              <h4 className="font-semibold text-responsive-3xs text-foreground">
                {backTitle}
              </h4>
              <div className="p-1 rounded-full bg-muted/50">
                <RotateCcw className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            
            {/* Total */}
            <div className="mb-2 pb-2 border-b border-border">
              <p className="text-responsive-3xs text-muted-foreground">Total</p>
              <p className="text-responsive-sm font-bold text-foreground">
                {formatNumber(backTotal, true)}
              </p>
            </div>
            
            {/* Lista de assessores */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-1">
                {backData.length > 0 ? (
                  backData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-responsive-3xs py-0.5"
                    >
                      <span className="font-medium text-foreground truncate max-w-[60%]">
                        {item.name}
                      </span>
                      <span className="font-medium text-secondary-foreground">
                        {formatNumber(item.value, true)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-responsive-3xs text-muted-foreground italic text-center py-2">
                    Sem dados
                  </p>
                )}
              </div>
            </div>
            
            {/* Instrução */}
            <p className="text-[9px] text-muted-foreground text-center mt-2 flex-shrink-0">
              Clique para voltar
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

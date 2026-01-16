import { AlertTriangle, CheckCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { useResponsiveSize } from "@/hooks/use-responsive-size";

export interface AssessorRemainingItem {
  name: string;
  remaining: number;
  achieved: boolean;
}

interface GaugeChartProps {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  warning?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "highlight";
  showRemaining?: boolean;
  secondaryValue?: number;
  secondaryPercentage?: number;
  secondaryLabel?: string;
  ritmoIdeal?: number;
  assessorRemainingData?: AssessorRemainingItem[];
  showAssessorList?: boolean;
  // Additional value for segmented bar visualization (e.g., Receita Empilhada)
  additionalValue?: number;
}
// Determina o alerta baseado na performance vs ritmo ideal
const getGaugeAlert = (currentPercentage: number, ritmoIdeal?: number): "GREEN" | "ORANGE" | "RED" | undefined => {
  if (ritmoIdeal === undefined) return undefined;
  
  if (currentPercentage >= ritmoIdeal) {
    return "GREEN";
  }
  
  const percentageBelowIdeal = ((ritmoIdeal - currentPercentage) / ritmoIdeal) * 100;
  
  if (percentageBelowIdeal > 50) {
    return "RED";
  }
  
  return "ORANGE";
};

function RitmoAlertDisplay({
  alertType,
  difference,
  isCurrency
}: {
  alertType?: "GREEN" | "ORANGE" | "RED";
  difference?: number;
  isCurrency?: boolean;
}) {
  if (!alertType) return null;
  
  const showDifference = difference !== undefined && difference < 0;
  
  const iconElement = (() => {
    switch (alertType) {
      case "GREEN":
        return <CheckCircle className="icon-responsive text-green-500" />;
      case "ORANGE":
        return <AlertTriangle className="icon-responsive text-orange-500 animate-pulse" />;
      case "RED":
        return <AlertTriangle className="icon-responsive text-red-500 animate-pulse" />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex flex-col items-center">
      {iconElement}
      {showDifference && (
        <span className={`text-[8px] font-bold ${alertType === "RED" ? "text-red-500" : "text-orange-500"}`}>
          {formatNumber(difference, isCurrency)}
        </span>
      )}
    </div>
  );
}
export function GaugeChart({
  label,
  value,
  target,
  percentage,
  isCurrency = false,
  warning = false,
  size = "md",
  variant = "default",
  showRemaining = false,
  secondaryValue,
  secondaryPercentage,
  secondaryLabel,
  ritmoIdeal,
  assessorRemainingData,
  showAssessorList = false,
  additionalValue
}: GaugeChartProps) {
  const {
    scale
  } = useResponsiveSize();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);

  // Dynamic sizing based on viewport
  const baseMultiplier = size === "sm" ? 0.7 : size === "md" ? 0.9 : 1.1;
  const dynamicScale = Math.max(0.6, Math.min(scale * baseMultiplier, 1.5));
  const dynamicWidth = Math.round(160 * dynamicScale);
  const dynamicHeight = Math.round(90 * dynamicScale);
  const dynamicStrokeWidth = Math.round(21 * dynamicScale);

  // Calcular alerta e diferença para o ritmo ideal
  const ritmoIdealValue = ritmoIdeal !== undefined && target > 0 
    ? Math.round(ritmoIdeal / 100 * target * 100) / 100 
    : undefined;
  const ritmoIdealDifference = ritmoIdealValue !== undefined 
    ? Math.round((value - ritmoIdealValue) * 100) / 100 
    : undefined;
  const alertType = getGaugeAlert(percentage, ritmoIdeal);
  const radius = (dynamicWidth - dynamicStrokeWidth) / 2;
  const circumference = Math.PI * radius;
  
  // Calculate segmented bar values when additionalValue is present
  const hasSegmentedBar = additionalValue && additionalValue > 0;
  const baseValue = hasSegmentedBar ? value - additionalValue : value;
  const basePercentage = target > 0 ? (baseValue / target) * 100 : 0;
  const clampedBasePercentage = Math.min(Math.max(basePercentage, 0), 100);
  const additionalPercentage = target > 0 && hasSegmentedBar ? (additionalValue / target) * 100 : 0;
  const clampedAdditionalPercentage = Math.min(Math.max(additionalPercentage, 0), 100 - clampedBasePercentage);
  
  const baseProgress = (clampedBasePercentage / 100) * circumference;
  const additionalProgress = (clampedAdditionalPercentage / 100) * circumference;
  const progress = clampedPercentage / 100 * circumference;
  
  const isHighlight = variant === "highlight";
  return <Card className={`p-responsive shadow-card h-full flex flex-col ${isHighlight ? "bg-chart-dark text-foreground" : "bg-card"}`}>
      <div className={`flex ${showAssessorList && assessorRemainingData && assessorRemainingData.length > 0 ? 'flex-row gap-3' : 'flex-col'} flex-1 min-h-0`}>
        {/* Gauge Container */}
        <div className={`flex flex-col items-center ${showAssessorList && assessorRemainingData && assessorRemainingData.length > 0 ? 'flex-1' : ''} min-h-0`}>
          <div className="flex items-center justify-between w-full mb-responsive">
            <h4 className={`font-semibold text-responsive-3xs ${isHighlight ? "text-card" : "text-foreground"} flex-1 truncate`}>
              {label}
            </h4>
            <div className="flex-shrink-0 ml-1">
              <RitmoAlertDisplay 
                alertType={alertType} 
                difference={ritmoIdealDifference}
                isCurrency={isCurrency}
              />
            </div>
          </div>

        {/* Dynamic SVG gauge */}
        <div className="relative flex-shrink-0" style={{
        width: dynamicWidth,
        height: dynamicHeight
      }}>
          <svg width={dynamicWidth} height={dynamicHeight} viewBox={`0 0 ${dynamicWidth} ${dynamicHeight}`} overflow="visible">
            {/* Background arc */}
            <path d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`} fill="none" stroke={isHighlight ? "hsl(0, 0%, 50%)" : "hsl(var(--muted))"} strokeWidth={dynamicStrokeWidth} strokeLinecap="round" />
            {/* Additional value arc (darker yellow/gold for Receita Empilhada) - vem primeiro */}
            {hasSegmentedBar && (
              <path 
                d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                    A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`} 
                fill="none" 
                stroke="#A67C00"
                strokeWidth={dynamicStrokeWidth} 
                strokeLinecap="butt" 
                strokeDasharray={circumference} 
                strokeDashoffset={circumference - additionalProgress}
                style={{ transition: "stroke-dashoffset 0.5s ease-out" }} 
              />
            )}
            
            {/* Progress arc - base value (PJ2 XP amarelo) - vem depois */}
            <path 
              d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`} 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth={dynamicStrokeWidth} 
              strokeLinecap="round" 
              strokeDasharray={circumference} 
              strokeDashoffset={hasSegmentedBar ? circumference - baseProgress : circumference - progress} 
              style={{ 
                transition: "stroke-dashoffset 0.5s ease-out, transform 0.5s ease-out",
                ...(hasSegmentedBar && {
                  transformOrigin: `${dynamicWidth / 2}px ${dynamicHeight}px`,
                  transform: `rotate(${(clampedAdditionalPercentage / 100) * 180}deg)`
                })
              }} 
            />
            
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
            <span className={`text-responsive-lg font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
              {formatNumber(value, isCurrency)}
            </span>
            {showRemaining && remainingValue > 0 && <span className="text-responsive-3xs text-muted-foreground font-medium">
                Faltam: {formatNumber(remainingValue, isCurrency)}
              </span>}
          </div>

          {/* Percentage label */}
          <div className="absolute text-responsive-xs font-bold pointer-events-none" style={{
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          color: isHighlight ? "hsl(var(--card))" : "hsl(var(--muted-foreground))"
        }}>
            {percentage}%
          </div>
        </div>

        {/* Min/Max labels */}
        <div className={`flex justify-between w-full mt-auto text-responsive-3xs flex-shrink-0 ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>

        {/* Secondary bar */}
        {secondaryPercentage !== undefined && <div className="w-full mt-responsive space-y-1 flex-shrink-0">
            <div className={`flex justify-between text-responsive-3xs ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
              <span>{secondaryLabel || "Agendadas"}</span>
              <span className="font-medium">{secondaryPercentage}%</span>
            </div>
            <div className="relative">
              <div className="h-bar-responsive-sm bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-500 transition-all duration-500" style={{
              width: `${Math.min(secondaryPercentage, 100)}%`
            }} />
              </div>
            </div>
          </div>}

        {isHighlight && <p className="text-responsive-3xs text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>}
        </div>

        {/* Lista de Falta por Assessor - integrada ao card */}
        {showAssessorList && assessorRemainingData && assessorRemainingData.length > 0 && (
          <div className="w-[90px] max-h-full overflow-hidden flex flex-col flex-shrink-0 border-l border-border pl-2">
            <p className="text-responsive-3xs text-muted-foreground mb-1 flex-shrink-0 font-semibold truncate">
              Falta p/ Assessor
            </p>
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="space-y-0.5">
                {assessorRemainingData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-responsive-3xs gap-1"
                  >
                    <span className="font-medium truncate max-w-[40px]" title={item.name}>
                      {item.name}
                    </span>
                    {item.achieved ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <span className="font-medium flex-shrink-0 text-secondary-foreground text-[9px]">
                        {formatNumber(item.remaining, isCurrency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>;
}
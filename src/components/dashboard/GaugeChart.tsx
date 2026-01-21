import { AlertTriangle, CheckCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { useResponsiveSize } from "@/hooks/use-responsive-size";
import { useTheme } from "next-themes";
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
  // Peso do KPI no cálculo do ICM (exibido ao lado do título)
  weight?: number;
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

const TOTAL_ICM_WEIGHT = 9.5;

function RitmoAlertDisplay({
  alertType,
  difference,
  isCurrency,
  weight,
  gapPercentage
}: {
  alertType?: "GREEN" | "ORANGE" | "RED";
  difference?: number;
  isCurrency?: boolean;
  weight?: number;
  gapPercentage?: number;
}) {
  if (!alertType) return null;
  
  const showDifference = difference !== undefined && difference < 0;
  
  // Calcular impacto no ICM se atingir o ritmo
  const icmImpact = weight && gapPercentage && gapPercentage > 0
    ? ((weight / TOTAL_ICM_WEIGHT) * gapPercentage).toFixed(1)
    : null;
  
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
        <>
          <span className={`text-responsive-4xs font-bold ${alertType === "RED" ? "text-red-500" : "text-orange-500"}`}>
            {formatNumber(difference, isCurrency)}
          </span>
          {icmImpact && (
            <span className="text-responsive-4xs font-medium text-blue-500">
              +{icmImpact}pp
            </span>
          )}
        </>
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
  additionalValue,
  weight
}: GaugeChartProps) {
  const { theme } = useTheme();
  const {
    scale
  } = useResponsiveSize();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);
  
  // Calcular gap em percentual para impacto no ICM
  const gapPercentage = ritmoIdeal !== undefined && percentage < ritmoIdeal
    ? ritmoIdeal - percentage
    : 0;
  
  // Calcular impacto total no ICM se atingir 100% da meta
  const remainingPercentage = target > 0 ? ((target - value) / target) * 100 : 0;
  const remainingImpact = weight && remainingValue > 0 && target > 0
    ? ((weight / TOTAL_ICM_WEIGHT) * remainingPercentage).toFixed(1)
    : null;

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

  // Ritmo ideal marker calculations
  const ritmoIdealAngle = ritmoIdeal !== undefined 
    ? Math.PI - (ritmoIdeal / 100) * Math.PI 
    : 0;
  const centerX = dynamicWidth / 2;
  const centerY = dynamicHeight;
  const markerInnerRadius = radius - dynamicStrokeWidth / 2 - 2;
  const markerOuterRadius = radius + dynamicStrokeWidth / 2 + 2;

  const markerX1 = centerX + Math.cos(ritmoIdealAngle) * markerInnerRadius;
  const markerY1 = centerY - Math.sin(ritmoIdealAngle) * markerInnerRadius;
  const markerX2 = centerX + Math.cos(ritmoIdealAngle) * markerOuterRadius;
  const markerY2 = centerY - Math.sin(ritmoIdealAngle) * markerOuterRadius;

  // Triangle (arrow) for ritmo ideal marker
  const triangleSize = 4 * dynamicScale;
  const perpAngle = ritmoIdealAngle + Math.PI / 2;
  const tipX = markerX2;
  const tipY = markerY2;
  const baseX1 = markerX2 - Math.cos(ritmoIdealAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
  const baseY1 = markerY2 + Math.sin(ritmoIdealAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
  const baseX2 = markerX2 - Math.cos(ritmoIdealAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
  const baseY2 = markerY2 + Math.sin(ritmoIdealAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;

  // Marker color - dark gray in light mode, light gray in dark mode
  const markerColor = theme === "dark" ? "#D1D5DB" : "#4B5563";
  return <Card className={`p-responsive shadow-card h-full flex flex-col overflow-hidden ${isHighlight ? "bg-chart-dark text-foreground" : "bg-card"}`}>
      <div className={`flex ${showAssessorList ? 'flex-row gap-3' : 'flex-col'} flex-1 min-h-0`}>
        {/* Gauge Container */}
        <div className={`flex flex-col items-center ${showAssessorList ? 'flex-1' : ''} min-h-0`}>
          <div className="flex items-center justify-between w-full mb-responsive">
            <h4 className={`font-semibold text-responsive-3xs ${isHighlight ? "text-card" : "text-foreground"} flex-1 truncate`}>
              {label}
              {weight !== undefined && (
                <span className="ml-1 text-muted-foreground font-normal">
                  x{weight}
                </span>
              )}
            </h4>
            <div className="flex-shrink-0 ml-1">
              <RitmoAlertDisplay 
                alertType={alertType} 
                difference={ritmoIdealDifference}
                isCurrency={isCurrency}
                weight={weight}
                gapPercentage={gapPercentage}
              />
            </div>
          </div>

        {/* Percentage label - acima do gauge */}
        <div className="flex justify-center">
          <span className={`text-responsive-sm font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
            {percentage}%
          </span>
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
            
            {/* Ritmo Ideal marker - linha + seta triangular */}
            {ritmoIdeal !== undefined && (
              <>
                <line 
                  x1={markerX1} 
                  y1={markerY1} 
                  x2={markerX2} 
                  y2={markerY2} 
                  stroke={markerColor} 
                  strokeWidth={2 * dynamicScale} 
                />
                <polygon 
                  points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} 
                  fill={markerColor} 
                />
              </>
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
            <span className={`text-responsive-lg font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
              {formatNumber(value, isCurrency)}
            </span>
            {showRemaining && (
              <span className={`text-responsive-3xs text-muted-foreground font-medium ${remainingValue <= 0 ? 'invisible' : ''}`}>
                Faltam: {formatNumber(remainingValue || 0, isCurrency)}
              </span>
            )}
          </div>

        </div>

        {/* Min/Max labels */}
        <div className={`flex justify-between w-full mt-auto text-responsive-3xs flex-shrink-0 ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>

        {/* Secondary bar - always reserve space */}
        <div className={`w-full mt-responsive space-y-1 flex-shrink-0 ${secondaryPercentage === undefined ? 'hidden' : ''}`}>
            <div className={`flex justify-between text-responsive-3xs ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
              <span>{secondaryLabel || "Agendadas"}</span>
              <span className="font-medium">{secondaryPercentage ?? 0}%</span>
            </div>
            <div className="relative">
              <div className="h-bar-responsive-sm bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-500 transition-all duration-500" style={{
              width: `${Math.min(secondaryPercentage ?? 0, 100)}%`
            }} />
              </div>
            </div>
          </div>

        {isHighlight && <p className="text-responsive-3xs text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>}
        </div>

        {/* Lista de Falta por Assessor - always reserve space when showAssessorList is true */}
        {showAssessorList && (
          <div className="w-[90px] max-h-full overflow-hidden flex flex-col flex-shrink-0 border-l border-border pl-2">
            <p className="text-responsive-3xs text-muted-foreground mb-1 flex-shrink-0 font-semibold truncate">
              Falta p/ Assessor
            </p>
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="space-y-0.5">
                {(assessorRemainingData || []).map((item, index) => (
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
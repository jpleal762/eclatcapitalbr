import { AlertTriangle, CheckCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";
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
  statusIcon?: KPIStatusIcon;
  showRemaining?: boolean;
  secondaryValue?: number;
  secondaryPercentage?: number;
  secondaryLabel?: string;
  ritmoIdeal?: number;
  assessorRemainingData?: AssessorRemainingItem[];
  showAssessorList?: boolean;
}
function StatusIconDisplay({
  icon,
  size
}: {
  icon?: KPIStatusIcon;
  size: "sm" | "md" | "lg";
}) {
  if (!icon) return null;
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className="icon-responsive text-green-500 animate-pulse" />;
    case "CLOCK":
      return;
    case "YELLOW_ALERT":
      return <AlertTriangle className="icon-responsive text-yellow-500 animate-pulse" />;
    case "RED_ALERT":
      return;
    default:
      return null;
  }
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
  statusIcon,
  showRemaining = false,
  secondaryValue,
  secondaryPercentage,
  secondaryLabel,
  ritmoIdeal,
  assessorRemainingData,
  showAssessorList = false
}: GaugeChartProps) {
  const {
    height,
    scale
  } = useResponsiveSize();
  const { theme } = useTheme();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);

  // Dynamic sizing based on viewport
  const baseMultiplier = size === "sm" ? 0.7 : size === "md" ? 0.9 : 1.1;
  const dynamicScale = Math.max(0.6, Math.min(scale * baseMultiplier, 1.5));
  const dynamicWidth = Math.round(160 * dynamicScale);
  const dynamicHeight = Math.round(90 * dynamicScale);
  const dynamicStrokeWidth = Math.round(21 * dynamicScale); // +50% thickness
  const clockPadding = Math.round(20 * dynamicScale); // Extra space for clock icons

  // Function to get clock style based on performance
  const getClockStyle = (currentValue: number, idealValue: number) => {
    const percentageBelowIdeal = idealValue > 0 ? (idealValue - currentValue) / idealValue * 100 : 0;
    if (currentValue >= idealValue) {
      return {
        color: 'hsl(142.1, 76.2%, 36.3%)',
        animate: false
      }; // green-500
    } else if (percentageBelowIdeal > 50) {
      return {
        color: 'hsl(0, 72.2%, 50.6%)',
        animate: true
      }; // red-500
    } else {
      return {
        color: 'hsl(47.9, 95.8%, 53.1%)',
        animate: true
      }; // yellow-500
    }
  };
  const radius = (dynamicWidth - dynamicStrokeWidth) / 2;
  const circumference = Math.PI * radius;
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
              <StatusIconDisplay icon={statusIcon} size={size} />
            </div>
          </div>

        {/* Dynamic SVG gauge */}
        <div className="relative flex-shrink-0" style={{
        width: dynamicWidth + clockPadding * 2,
        height: dynamicHeight + clockPadding
      }}>
          <svg width={dynamicWidth + clockPadding * 2} height={dynamicHeight + clockPadding} viewBox={`${-clockPadding} ${-clockPadding} ${dynamicWidth + clockPadding * 2} ${dynamicHeight + clockPadding}`} overflow="visible">
            {/* Background arc */}
            <path d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`} fill="none" stroke={isHighlight ? "hsl(0, 0%, 50%)" : "hsl(var(--muted))"} strokeWidth={dynamicStrokeWidth} strokeLinecap="round" />
            {/* Progress arc */}
            <path d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`} fill="none" stroke="hsl(var(--primary))" strokeWidth={dynamicStrokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{
            transition: "stroke-dashoffset 0.5s ease-out"
          }} />
            
            {/* Ritmo Ideal marker - integrated in main SVG */}
            {ritmoIdeal !== undefined && (() => {
              const ritmoIdealAngle = Math.PI - ritmoIdeal / 100 * Math.PI;
              const centerX = dynamicWidth / 2;
              const centerY = dynamicHeight;
              const markerInnerRadius = radius - dynamicStrokeWidth / 2 - 2;
              const markerOuterRadius = radius + dynamicStrokeWidth / 2 + 2;
              const ritmoIdealValue = Math.round(ritmoIdeal / 100 * target * 100) / 100;
              const realDifference = Math.round((value - ritmoIdealValue) * 100) / 100;
              const differenceText = realDifference >= 0 ? `+${formatNumber(realDifference, isCurrency)}` : formatNumber(realDifference, isCurrency);
              const x1 = centerX + Math.cos(ritmoIdealAngle) * markerInnerRadius;
              const y1 = centerY - Math.sin(ritmoIdealAngle) * markerInnerRadius;
              const x2 = centerX + Math.cos(ritmoIdealAngle) * markerOuterRadius;
              const y2 = centerY - Math.sin(ritmoIdealAngle) * markerOuterRadius;

              const clockOffset = (dynamicStrokeWidth / 2) + 6 * dynamicScale;
              const clockX = centerX + Math.cos(ritmoIdealAngle) * (radius + clockOffset);
              const clockY = centerY - Math.sin(ritmoIdealAngle) * (radius + clockOffset);
              const triangleSize = 4 * dynamicScale;
              const perpAngle = ritmoIdealAngle + Math.PI / 2;
              const tipX = x2;
              const tipY = y2;
              const baseX1 = x2 - Math.cos(ritmoIdealAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
              const baseY1 = y2 + Math.sin(ritmoIdealAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
              const baseX2 = x2 - Math.cos(ritmoIdealAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
              const baseY2 = y2 + Math.sin(ritmoIdealAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;
              
              const markerColor = theme === "dark" ? "#D1D5DB" : "#4B5563";
              const clockStyle = getClockStyle(percentage, ritmoIdeal);
              const showDifference = percentage < ritmoIdeal;
              
              return (
                <g style={{ transition: 'all 0.5s ease-out' }}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={markerColor} strokeWidth={2 * dynamicScale} />
                  <polygon points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} fill={markerColor} />
                  
                  {/* Clock icon at marker */}
                  <g transform={`translate(${clockX}, ${clockY})`} className={clockStyle.animate ? 'animate-pulse-clock' : ''}>
                    <circle r={9 * dynamicScale} fill="rgba(0,0,0,0.15)" />
                    <circle r={8 * dynamicScale} fill={clockStyle.color} />
                    <circle r={6 * dynamicScale} fill="none" stroke="white" strokeWidth={1 * dynamicScale} />
                    <line x1={0} y1={0} x2={0} y2={-3.5 * dynamicScale} stroke="white" strokeWidth={1 * dynamicScale} strokeLinecap="round" />
                    <line x1={0} y1={0} x2={2.5 * dynamicScale} y2={0} stroke="white" strokeWidth={1 * dynamicScale} strokeLinecap="round" />
                    <circle r={0.8 * dynamicScale} fill="white" />
                    
                    {showDifference && (
                      <text x={0} y={16 * dynamicScale} textAnchor="middle" fill={clockStyle.color} fontSize={10 * dynamicScale} fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {differenceText}
                      </text>
                    )}
                  </g>
                </g>
              );
            })()}
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
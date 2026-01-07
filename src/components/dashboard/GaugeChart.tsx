import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";
import { useResponsiveSize } from "@/hooks/use-responsive-size";

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
  isTvMode?: boolean;
  showRemaining?: boolean;
  secondaryValue?: number;
  secondaryPercentage?: number;
  secondaryLabel?: string;
  ritmoIdeal?: number;
}

function StatusIconDisplay({ icon, size }: { icon?: KPIStatusIcon; size: "sm" | "md" | "lg" }) {
  if (!icon) return null;
  
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className="icon-responsive text-green-500 animate-pulse" />;
    case "CLOCK":
      return <Clock className="icon-responsive text-blue-500" />;
    case "YELLOW_ALERT":
      return <AlertTriangle className="icon-responsive text-yellow-500 animate-pulse" />;
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive text-red-500 animate-bounce" />;
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
  isTvMode = false,
  showRemaining = false,
  secondaryValue,
  secondaryPercentage,
  secondaryLabel,
  ritmoIdeal,
}: GaugeChartProps) {
  const { height, scale } = useResponsiveSize();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);
  
  // Dynamic sizing based on viewport
  const baseMultiplier = size === "sm" ? 0.7 : size === "md" ? 0.9 : 1.1;
  const tvMultiplier = isTvMode ? 1.2 : 1;
  const dynamicScale = Math.max(0.6, Math.min(scale * baseMultiplier * tvMultiplier, 1.5));
  
  const dynamicWidth = Math.round(160 * dynamicScale);
  const dynamicHeight = Math.round(90 * dynamicScale);
  const dynamicStrokeWidth = Math.round(14 * dynamicScale);
  
  const radius = (dynamicWidth - dynamicStrokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  const isHighlight = variant === "highlight";

  return (
    <Card className={`p-responsive shadow-card h-full flex flex-col ${isHighlight ? "bg-chart-dark text-foreground" : "bg-card"}`}>
      <div className="flex flex-col items-center flex-1 min-h-0">
        <div className="flex items-center justify-between w-full mb-responsive">
          <h4 className={`font-semibold text-responsive-xs ${isHighlight ? "text-card" : "text-foreground"} flex-1 truncate`}>
            {label}
          </h4>
          <div className="flex-shrink-0 ml-1">
            <StatusIconDisplay icon={statusIcon} size={size} />
          </div>
        </div>

        {/* Dynamic SVG gauge */}
        <div className="relative flex-shrink-0" style={{ width: dynamicWidth, height: dynamicHeight + 10 }}>
          <svg
            width={dynamicWidth}
            height={dynamicHeight + 10}
            viewBox={`0 0 ${dynamicWidth} ${dynamicHeight + 10}`}
          >
            {/* Background arc */}
            <path
              d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`}
              fill="none"
              stroke={isHighlight ? "hsl(0, 0%, 50%)" : "hsl(var(--muted))"}
              strokeWidth={dynamicStrokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={dynamicStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>

          {/* Ritmo Ideal marker */}
          {ritmoIdeal !== undefined && (() => {
            const ritmoIdealAngle = Math.PI - (ritmoIdeal / 100) * Math.PI;
            const centerX = dynamicWidth / 2;
            const centerY = dynamicHeight;
            const markerInnerRadius = radius - dynamicStrokeWidth / 2 - 2;
            const markerOuterRadius = radius + dynamicStrokeWidth / 2 + 2;
            
            const triggerX = centerX + Math.cos(ritmoIdealAngle) * radius;
            const triggerY = centerY - Math.sin(ritmoIdealAngle) * radius;
            
            const ritmoIdealValue = Math.round(((ritmoIdeal / 100) * target) * 100) / 100;
            const realDifference = Math.round((value - ritmoIdealValue) * 100) / 100;
            const differenceText = realDifference >= 0 
              ? `+${formatNumber(realDifference, isCurrency)}` 
              : formatNumber(realDifference, isCurrency);

            const x1 = centerX + Math.cos(ritmoIdealAngle) * markerInnerRadius;
            const y1 = centerY - Math.sin(ritmoIdealAngle) * markerInnerRadius;
            const x2 = centerX + Math.cos(ritmoIdealAngle) * markerOuterRadius;
            const y2 = centerY - Math.sin(ritmoIdealAngle) * markerOuterRadius;
            
            const triangleSize = 4 * dynamicScale;
            const perpAngle = ritmoIdealAngle + Math.PI / 2;
            const tipX = x2;
            const tipY = y2;
            const baseX1 = x2 - Math.cos(ritmoIdealAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
            const baseY1 = y2 + Math.sin(ritmoIdealAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
            const baseX2 = x2 - Math.cos(ritmoIdealAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
            const baseY2 = y2 + Math.sin(ritmoIdealAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;

            return (
              <>
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={dynamicWidth}
                  height={dynamicHeight + 10}
                  viewBox={`0 0 ${dynamicWidth} ${dynamicHeight + 10}`}
                  style={{ transition: 'all 0.5s ease-out' }}
                >
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2 * dynamicScale} 
                  />
                  <polygon 
                    points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`}
                    fill="hsl(var(--primary))"
                  />
                  {/* Clock icon at marker */}
                  <g transform={`translate(${x2 + Math.cos(ritmoIdealAngle) * 6}, ${y2 - Math.sin(ritmoIdealAngle) * 6})`}>
                    <circle r={4 * dynamicScale} fill="hsl(var(--primary))" />
                    <circle r={3 * dynamicScale} fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth={0.5 * dynamicScale} />
                    <line x1={0} y1={0} x2={0} y2={-1.5 * dynamicScale} stroke="hsl(var(--primary-foreground))" strokeWidth={0.5 * dynamicScale} />
                    <line x1={0} y1={0} x2={1 * dynamicScale} y2={0} stroke="hsl(var(--primary-foreground))" strokeWidth={0.5 * dynamicScale} />
                  </g>
                </svg>
                
                <div 
                  className="absolute z-20 text-responsive-3xs font-bold whitespace-nowrap pointer-events-none"
                  style={{
                    left: triggerX,
                    top: triggerY,
                    transform: `translate(${ritmoIdeal > 50 ? '0%' : '-100%'}, -50%) translateX(${ritmoIdeal > 50 ? '8px' : '-8px'})`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  <span className="text-primary">{differenceText}</span>
                </div>
              </>
            );
          })()}

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
            <span className={`text-responsive-base font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
              {formatNumber(value, isCurrency)}
            </span>
            {showRemaining && remainingValue > 0 && (
              <span className="text-responsive-3xs text-muted-foreground font-medium">
                Faltam: {formatNumber(remainingValue, isCurrency)}
              </span>
            )}
          </div>

          {/* Percentage label */}
          <div 
            className="absolute text-responsive-2xs font-bold pointer-events-none"
            style={{
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              color: isHighlight ? "hsl(var(--card))" : "hsl(var(--muted-foreground))",
            }}
          >
            {percentage}%
          </div>
        </div>

        {/* Min/Max labels */}
        <div className={`flex justify-between w-full mt-auto text-responsive-3xs flex-shrink-0 ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>

        {/* Secondary bar */}
        {secondaryPercentage !== undefined && (
          <div className="w-full mt-responsive space-y-1 flex-shrink-0">
            <div className={`flex justify-between text-responsive-3xs ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
              <span>{secondaryLabel || "Agendadas"}</span>
              <span className="font-medium">{secondaryPercentage}%</span>
            </div>
            <div className="relative">
              <div className="h-bar-responsive-sm bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-500 transition-all duration-500"
                  style={{ width: `${Math.min(secondaryPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {isHighlight && (
          <p className="text-responsive-3xs text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>
        )}
      </div>
    </Card>
  );
}

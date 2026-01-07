import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";

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
  // Secondary bar props
  secondaryValue?: number;
  secondaryPercentage?: number;
  secondaryLabel?: string;
  ritmoIdeal?: number;
}

function StatusIconDisplay({ icon, size }: { icon?: KPIStatusIcon; size: "sm" | "md" | "lg" }) {
  if (!icon) return null;
  
  const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
  
  switch (icon) {
    case "GREEN_CHECK":
      return (
        <CheckCircle 
          className="text-green-500 animate-pulse" 
          size={iconSize} 
        />
      );
    case "CLOCK":
      return (
        <Clock 
          className="text-blue-500" 
          size={iconSize} 
        />
      );
    case "YELLOW_ALERT":
      return (
        <AlertTriangle 
          className="text-yellow-500 animate-pulse" 
          size={iconSize} 
        />
      );
    case "RED_ALERT":
      return (
        <AlertTriangle 
          className="text-red-500 animate-bounce" 
          size={iconSize} 
        />
      );
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
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);
  
  // Configuração normal (mensal)
  const normalSizeConfig = {
    sm: { width: 100, height: 60, strokeWidth: 10, fontSize: "text-[10px]", labelSize: "text-[9px]", percentSize: "text-[10px]" },
    md: { width: 130, height: 75, strokeWidth: 12, fontSize: "text-sm", labelSize: "text-xs", percentSize: "text-xs" },
    lg: { width: 160, height: 90, strokeWidth: 14, fontSize: "text-lg", labelSize: "text-xs", percentSize: "text-sm" },
  };

  // Configuração TV (barras mais grossas e fontes maiores)
  const tvSizeConfig = {
    sm: { width: 110, height: 65, strokeWidth: 18, fontSize: "text-xs", labelSize: "text-[10px]", percentSize: "text-xs" },
    md: { width: 140, height: 80, strokeWidth: 24, fontSize: "text-lg", labelSize: "text-sm", percentSize: "text-base" },
    lg: { width: 180, height: 100, strokeWidth: 28, fontSize: "text-2xl", labelSize: "text-sm", percentSize: "text-lg" },
  };

  const config = isTvMode ? tvSizeConfig[size] : normalSizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  const isHighlight = variant === "highlight";

  return (
    <Card className={`p-3 shadow-card h-full flex flex-col ${isHighlight ? "bg-chart-dark text-foreground" : "bg-card"}`}>
      <div className="flex flex-col items-center flex-1 min-h-0">
        <div className="flex items-center justify-between w-full mb-1">
          <h4 className={`font-semibold ${config.labelSize} ${isHighlight ? "text-card" : "text-foreground"} flex-1 truncate`}>
            {label}
          </h4>
          <div className="flex-shrink-0 ml-1">
            <StatusIconDisplay icon={statusIcon} size={size} />
          </div>
        </div>

        {/* Fixed-size wrapper for precise positioning */}
        <div className="relative flex-shrink-0" style={{ width: config.width, height: config.height + 10 }}>
          <svg
            width={config.width}
            height={config.height + 10}
            viewBox={`0 0 ${config.width} ${config.height + 10}`}
          >
            {/* Background arc */}
            <path
              d={`M ${config.strokeWidth / 2} ${config.height} 
                  A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
              fill="none"
              stroke={isHighlight ? "hsl(0, 0%, 50%)" : "hsl(var(--muted))"}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={`M ${config.strokeWidth / 2} ${config.height} 
                  A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>

          {/* Ritmo Ideal marker - SVG visual + invisible HTML trigger for tooltip */}
          {ritmoIdeal !== undefined && (() => {
            const ritmoIdealAngle = Math.PI - (ritmoIdeal / 100) * Math.PI;
            const centerX = config.width / 2;
            const centerY = config.height;
            const markerInnerRadius = radius - config.strokeWidth / 2 - 2;
            const markerOuterRadius = radius + config.strokeWidth / 2 + 2;
            
            // Posição do trigger no centro do arco
            const triggerX = centerX + Math.cos(ritmoIdealAngle) * radius;
            const triggerY = centerY - Math.sin(ritmoIdealAngle) * radius;
            
            // Calcular valores reais ao invés de percentuais (arredondado para 2 casas decimais)
            const ritmoIdealValue = Math.round(((ritmoIdeal / 100) * target) * 100) / 100;
            const realDifference = Math.round((value - ritmoIdealValue) * 100) / 100;
            const differenceText = realDifference >= 0 
              ? `+${formatNumber(realDifference, isCurrency)}` 
              : formatNumber(realDifference, isCurrency);
            const differenceColor = realDifference >= 0 ? 'text-green-600' : 'text-red-600';

            // Calcular pontos para o marcador SVG
            const x1 = centerX + Math.cos(ritmoIdealAngle) * markerInnerRadius;
            const y1 = centerY - Math.sin(ritmoIdealAngle) * markerInnerRadius;
            const x2 = centerX + Math.cos(ritmoIdealAngle) * markerOuterRadius;
            const y2 = centerY - Math.sin(ritmoIdealAngle) * markerOuterRadius;
            
            // Triângulo na ponta externa
            const triangleSize = isTvMode ? 5 : 4;
            const perpAngle = ritmoIdealAngle + Math.PI / 2;
            const tipX = x2;
            const tipY = y2;
            const baseX1 = x2 - Math.cos(ritmoIdealAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
            const baseY1 = y2 + Math.sin(ritmoIdealAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
            const baseX2 = x2 - Math.cos(ritmoIdealAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
            const baseY2 = y2 + Math.sin(ritmoIdealAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;

            return (
              <>
                {/* SVG Marker - visual only */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={config.width}
                  height={config.height + 10}
                  viewBox={`0 0 ${config.width} ${config.height + 10}`}
                  style={{ transition: 'all 0.5s ease-out' }}
                >
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={isTvMode ? 3 : 2} 
                  />
                  <polygon 
                    points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`}
                    fill="hsl(var(--primary))"
                  />
                </svg>
                
                {/* Label sempre visível - posicionado junto ao marcador */}
                <div 
                  className="absolute z-20 text-[9px] font-bold whitespace-nowrap pointer-events-none"
                  style={{
                    left: triggerX,
                    top: triggerY,
                    transform: `translate(${ritmoIdeal > 50 ? '-100%' : '0%'}, -50%) translateX(${ritmoIdeal > 50 ? '-8px' : '8px'})`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  <span className={differenceColor}>{differenceText}</span>
                </div>
              </>
            );
          })()}

          {/* Center content - pointer-events-none to not block tooltip */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
            <span className={`${config.fontSize} font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
              {formatNumber(value, isCurrency)}
            </span>
            {showRemaining && remainingValue > 0 && (
              <span className={`${isTvMode ? 'text-xs' : 'text-[8px]'} text-muted-foreground font-medium`}>
                Faltam: {formatNumber(remainingValue, isCurrency)}
              </span>
            )}
          </div>

          {/* Percentage label - pointer-events-none to not block tooltip */}
          <div 
            className={`absolute ${config.percentSize} font-bold pointer-events-none`}
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
        <div className={`flex justify-between w-full mt-auto ${isTvMode ? 'text-[10px]' : 'text-[9px]'} flex-shrink-0 ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>

        {/* Secondary bar - gray indicator below gauge */}
        {secondaryPercentage !== undefined && (
          <div className="w-full mt-2 space-y-1 flex-shrink-0">
            <div className={`flex justify-between ${isTvMode ? 'text-xs' : 'text-[10px]'} ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
              <span>{secondaryLabel || "Agendadas"}</span>
              <span className="font-medium">{secondaryPercentage}%</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-500 transition-all duration-500"
                  style={{ width: `${Math.min(secondaryPercentage, 100)}%` }}
                />
              </div>
              {ritmoIdeal !== undefined && (() => {
                const secondaryRitmoValue = Math.round(((ritmoIdeal / 100) * target) * 100) / 100;
                const secondaryRealDiff = Math.round(((secondaryValue ?? 0) - secondaryRitmoValue) * 100) / 100;
                const isPositive = secondaryRealDiff >= 0;
                
                return (
                  <>
                    {/* Marcador visual */}
                    <div 
                      className="absolute top-0 flex flex-col items-center transition-all duration-500 ease-out"
                      style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-primary" />
                      <div className="w-0.5 h-2 bg-primary -mt-0.5" />
                    </div>
                    
                    {/* Label sempre visível - junto ao marcador */}
                    <div 
                      className="absolute text-[9px] font-bold whitespace-nowrap"
                      style={{ 
                        left: `${Math.min(ritmoIdeal, 100)}%`, 
                        top: '-14px',
                        transform: `translateX(${ritmoIdeal > 50 ? '-100%' : '0%'})`,
                        transition: 'all 0.5s ease-out',
                      }}
                    >
                      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                        {isPositive ? '+' : ''}{formatNumber(secondaryRealDiff, isCurrency)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {isHighlight && (
          <p className="text-[10px] text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>
        )}
      </div>
    </Card>
  );
}

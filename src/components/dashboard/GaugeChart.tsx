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

        <div className="relative flex-1 flex items-center justify-center" style={{ width: config.width, minHeight: config.height }}>
          <svg
            width={config.width}
            height={config.height}
            viewBox={`0 0 ${config.width} ${config.height + 10}`}
            className="flex-shrink-0"
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

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={`${config.fontSize} font-bold ${isHighlight ? "text-card" : "text-foreground"}`}>
              {formatNumber(value, isCurrency)}
            </span>
            {showRemaining && remainingValue > 0 && (
              <span className={`${isTvMode ? 'text-xs' : 'text-[8px]'} text-muted-foreground font-medium`}>
                Faltam: {formatNumber(remainingValue, isCurrency)}
              </span>
            )}
          </div>

          {/* Percentage label */}
          <div 
            className={`absolute ${config.percentSize} font-bold`}
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

        {isHighlight && (
          <p className="text-[10px] text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>
        )}
      </div>
    </Card>
  );
}

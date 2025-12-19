import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";

interface YearlyGaugeChartProps {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  warning?: boolean;
  size?: "sm" | "md" | "lg";
  statusIcon?: KPIStatusIcon;
}

function StatusIconDisplay({ icon, size }: { icon?: KPIStatusIcon; size: "sm" | "md" | "lg" }) {
  if (!icon) return null;
  
  const iconSize = size === "sm" ? 14 : size === "md" ? 16 : 20;
  
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

export function YearlyGaugeChart({
  label,
  value,
  target,
  percentage,
  isCurrency = false,
  warning = false,
  size = "md",
  statusIcon,
}: YearlyGaugeChartProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const sizeConfig = {
    sm: { width: 120, height: 70, strokeWidth: 8, fontSize: "text-sm", labelSize: "text-xs" },
    md: { width: 160, height: 90, strokeWidth: 10, fontSize: "text-base", labelSize: "text-xs" },
    lg: { width: 200, height: 110, strokeWidth: 12, fontSize: "text-xl", labelSize: "text-sm" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  return (
    <Card className="p-4 shadow-card bg-card border-l-4 border-l-chart-graphite">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-2">
          <h4 className={`font-semibold ${config.labelSize} text-foreground flex-1 truncate`}>
            {label}
          </h4>
          <div className="flex-shrink-0 ml-1">
            <StatusIconDisplay icon={statusIcon} size={size} />
          </div>
        </div>

        <div className="relative" style={{ width: config.width, height: config.height }}>
          <svg
            width={config.width}
            height={config.height}
            viewBox={`0 0 ${config.width} ${config.height + 10}`}
          >
            {/* Background arc */}
            <path
              d={`M ${config.strokeWidth / 2} ${config.height} 
                  A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc - GRAPHITE color for yearly */}
            <path
              d={`M ${config.strokeWidth / 2} ${config.height} 
                  A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
              fill="none"
              stroke="hsl(var(--chart-graphite))"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={`${config.fontSize} font-bold text-foreground`}>
              {formatNumber(value, isCurrency)}
            </span>
          </div>

          {/* Percentage label */}
          <div 
            className="absolute text-xs font-medium"
            style={{
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "hsl(var(--chart-graphite))",
            }}
          >
            {percentage}%
          </div>
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between w-full mt-1 text-xs text-muted-foreground">
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>
      </div>
    </Card>
  );
}

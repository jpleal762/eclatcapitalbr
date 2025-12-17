import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";

interface GaugeChartProps {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  warning?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "highlight";
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
}: GaugeChartProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const angle = (clampedPercentage / 100) * 180;
  
  const sizeConfig = {
    sm: { width: 120, height: 70, strokeWidth: 8, fontSize: "text-lg", labelSize: "text-xs" },
    md: { width: 160, height: 90, strokeWidth: 10, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { width: 200, height: 110, strokeWidth: 12, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  const isHighlight = variant === "highlight";

  return (
    <Card className={`p-4 shadow-card ${isHighlight ? "bg-chart-dark text-foreground" : "bg-card"}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-2">
          <h4 className={`font-semibold ${config.labelSize} ${isHighlight ? "text-card" : "text-foreground"}`}>
            {label}
          </h4>
          {warning && percentage < 50 && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
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
          </div>

          {/* Percentage label */}
          <div 
            className="absolute text-xs font-medium"
            style={{
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              color: isHighlight ? "hsl(var(--card))" : "hsl(var(--muted-foreground))",
            }}
          >
            {percentage}%
          </div>
        </div>

        {/* Min/Max labels */}
        <div className={`flex justify-between w-full mt-1 text-xs ${isHighlight ? "text-card/70" : "text-muted-foreground"}`}>
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>

        {isHighlight && (
          <p className="text-xs text-card/70 mt-1 italic">Head Bruno</p>
        )}
      </div>
    </Card>
  );
}

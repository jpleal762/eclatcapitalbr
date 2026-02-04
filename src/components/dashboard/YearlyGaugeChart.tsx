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
  
  switch (icon) {
    case "GREEN_CHECK":
      return <CheckCircle className="icon-responsive text-green-500 animate-pulse" />;
    case "CLOCK":
      return <Clock className="icon-responsive text-blue-500" />;
    case "YELLOW_ALERT":
      return <AlertTriangle className="icon-responsive text-eclat-gold animate-pulse" />;
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive text-red-500 animate-bounce" />;
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
  
  // Fixed dimensions based on size - 2x increase
  const dimensions = {
    sm: { width: 112, height: 64, stroke: 8 },
    md: { width: 144, height: 82, stroke: 10 },
    lg: { width: 176, height: 100, stroke: 12 },
  };
  
  const { width: dynamicWidth, height: dynamicHeight, stroke: dynamicStrokeWidth } = dimensions[size];
  
  const radius = (dynamicWidth - dynamicStrokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  return (
    <Card className="p-responsive shadow-card bg-card border-l-4 border-l-chart-graphite h-full flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex items-center justify-between w-full mb-responsive">
          <h4 className="font-semibold text-responsive-xs text-foreground flex-1 truncate">
            {label}
          </h4>
          <div className="flex-shrink-0 ml-1">
            <StatusIconDisplay icon={statusIcon} size={size} />
          </div>
        </div>

        {/* Percentage label - acima do gauge */}
        <div className="flex justify-center -mb-2">
          <span className="text-responsive-xs font-bold text-outline" style={{ color: "hsl(var(--chart-graphite))" }}>
            {percentage}%
          </span>
        </div>

        <div className="relative" style={{ width: dynamicWidth, height: dynamicHeight }}>
          <svg
            width={dynamicWidth}
            height={dynamicHeight}
            viewBox={`0 0 ${dynamicWidth} ${dynamicHeight + 10}`}
          >
            {/* Background arc */}
            <path
              d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={dynamicStrokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc - GRAPHITE color for yearly */}
            <path
              d={`M ${dynamicStrokeWidth / 2} ${dynamicHeight} 
                  A ${radius} ${radius} 0 0 1 ${dynamicWidth - dynamicStrokeWidth / 2} ${dynamicHeight}`}
              fill="none"
              stroke="hsl(var(--chart-graphite))"
              strokeWidth={dynamicStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-responsive-base font-bold text-foreground">
              {formatNumber(value, isCurrency)}
            </span>
          </div>

        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between w-full mt-responsive text-responsive-3xs text-muted-foreground">
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>
      </div>
    </Card>
  );
}

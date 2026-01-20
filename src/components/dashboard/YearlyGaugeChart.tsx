import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { KPIStatusIcon } from "@/types/kpi";
import { useResponsiveSize } from "@/hooks/use-responsive-size";

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
  const { scale } = useResponsiveSize();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Dynamic sizing
  const baseMultiplier = size === "sm" ? 0.7 : size === "md" ? 0.9 : 1.1;
  const dynamicScale = Math.max(0.6, Math.min(scale * baseMultiplier, 1.4));
  
  const dynamicWidth = Math.round(160 * dynamicScale);
  const dynamicHeight = Math.round(90 * dynamicScale);
  const dynamicStrokeWidth = Math.round(10 * dynamicScale);
  
  const radius = (dynamicWidth - dynamicStrokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (clampedPercentage / 100) * circumference;

  return (
    <Card className="p-responsive shadow-card bg-card border-l-4 border-l-chart-graphite">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-responsive">
          <h4 className="font-semibold text-responsive-xs text-foreground flex-1 truncate">
            {label}
          </h4>
          <div className="flex-shrink-0 ml-1">
            <StatusIconDisplay icon={statusIcon} size={size} />
          </div>
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

          {/* Percentage label */}
          <div 
            className="absolute text-responsive-2xs font-medium"
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
        <div className="flex justify-between w-full mt-responsive text-responsive-3xs text-muted-foreground">
          <span>{isCurrency ? "0 Mi" : "0"}</span>
          <span>{formatNumber(target, isCurrency)}</span>
        </div>
      </div>
    </Card>
  );
}

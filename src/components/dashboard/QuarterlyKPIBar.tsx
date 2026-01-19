import { QuarterlyKPI } from "@/lib/quarterlyKpiUtils";

interface QuarterlyKPIBarProps extends QuarterlyKPI {}

// Format value for display
function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}Mi`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString("pt-BR")}`;
  }
  return value.toLocaleString("pt-BR");
}

// Get color class based on percentage
function getBarColor(percentage: number): string {
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 75) return "bg-yellow-500";
  if (percentage >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function getTextColor(percentage: number): string {
  if (percentage >= 100) return "text-green-600 dark:text-green-400";
  if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400";
  if (percentage >= 50) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function QuarterlyKPIBar({ label, value, target, percentage, isCurrency }: QuarterlyKPIBarProps) {
  const barWidth = Math.min(percentage, 100);
  const barColor = getBarColor(percentage);
  const textColor = getTextColor(percentage);

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      {/* Label and percentage */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-foreground text-sm md:text-base">{label}</span>
        <span className={`font-bold text-lg md:text-xl ${textColor}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-6 md:h-8 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${barWidth}%` }}
        />
        {/* Month dividers (3 equal parts) */}
        <div 
          className="absolute top-0 h-full w-px bg-foreground/20"
          style={{ left: "33.33%" }}
        />
        <div 
          className="absolute top-0 h-full w-px bg-foreground/20"
          style={{ left: "66.66%" }}
        />
        {/* 100% marker */}
        {percentage < 100 && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-foreground/30"
            style={{ left: "100%" }}
          />
        )}
      </div>

      {/* Values */}
      <div className="flex justify-between items-center text-xs md:text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{formatValue(value, isCurrency)}</span>
          {" / "}
          {formatValue(target, isCurrency)}
        </span>
        {percentage > 100 && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            +{formatValue(value - target, isCurrency)}
          </span>
        )}
        {percentage < 100 && target > 0 && (
          <span className="text-muted-foreground">
            Falta: {formatValue(target - value, isCurrency)}
          </span>
        )}
      </div>
    </div>
  );
}

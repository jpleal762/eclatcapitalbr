import { QuarterlyKPI } from "@/lib/quarterlyKpiUtils";

interface QuarterlyKPIBarProps extends QuarterlyKPI {
  ritmoIdeal: number;
}

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

// Get color class based on percentage vs ritmo ideal
function getBarColor(percentage: number, ritmoIdeal: number): string {
  if (ritmoIdeal <= 0) return "bg-green-500"; // Trimestre futuro
  
  if (percentage >= ritmoIdeal) return "bg-green-500";
  if (percentage >= ritmoIdeal * 0.5) return "bg-yellow-500";
  return "bg-red-500";
}

function getTextColor(percentage: number, ritmoIdeal: number): string {
  if (ritmoIdeal <= 0) return "text-green-600 dark:text-green-400"; // Trimestre futuro
  
  if (percentage >= ritmoIdeal) return "text-green-600 dark:text-green-400";
  if (percentage >= ritmoIdeal * 0.5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export function QuarterlyKPIBar({ label, value, target, percentage, isCurrency, ritmoIdeal }: QuarterlyKPIBarProps) {
  const barWidth = Math.min(percentage, 100);
  const barColor = getBarColor(percentage, ritmoIdeal);
  const textColor = getTextColor(percentage, ritmoIdeal);

  return (
    <div className="bg-card rounded-lg p-responsive-sm lg:p-responsive h-full flex flex-col border border-border shadow-sm">
      {/* Label and percentage */}
      <div className="flex justify-between items-center mb-responsive">
        <span className="font-semibold text-foreground text-responsive-xs">{label}</span>
        <span className={`font-bold text-responsive-sm ${textColor}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar - takes available space */}
      <div className="relative flex-1 min-h-[clamp(12px,1.5vh,24px)] bg-muted rounded-full overflow-hidden">
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
        
        {/* Ideal Rhythm Marker */}
        {ritmoIdeal > 0 && ritmoIdeal <= 100 && (
          <div 
            className="absolute top-0 h-full flex flex-col items-center z-10"
            style={{ left: `${ritmoIdeal}%`, transform: "translateX(-50%)" }}
          >
            {/* Vertical line */}
            <div className="h-full w-0.5 bg-blue-500" />
          </div>
        )}
        
        {/* 100% marker */}
        {percentage < 100 && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-foreground/30"
            style={{ left: "100%" }}
          />
        )}
      </div>
      
      {/* Rhythm indicator below bar */}
      {ritmoIdeal > 0 && ritmoIdeal <= 100 && (
        <div 
          className="relative h-[clamp(10px,1.2vh,16px)] mt-responsive"
          style={{ marginLeft: `${ritmoIdeal}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute flex flex-col items-center">
            {/* Triangle */}
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-blue-500" />
            {/* Label */}
            <span className="text-responsive-3xs text-blue-500 font-medium whitespace-nowrap">
              Ritmo {ritmoIdeal}%
            </span>
          </div>
        </div>
      )}

      {/* Values */}
      <div className="flex justify-between items-center text-responsive-2xs text-muted-foreground mt-responsive">
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

import { Clock } from "lucide-react";

interface ProgressBarProps {
  label: string;
  percentage: number;
  color?: "primary" | "muted";
  variant?: "default" | "gray";
  isTvMode?: boolean;
  ritmoIdeal?: number;
}

export function ProgressBar({ label, percentage, color = "primary", variant = "default", isTvMode = false, ritmoIdeal }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const getBarColor = () => {
    if (variant === "gray") return "bg-chart-dark";
    return color === "primary" ? "bg-primary" : "bg-chart-dark";
  };

  // Calculate difference for tooltip
  const difference = ritmoIdeal !== undefined ? percentage - ritmoIdeal : 0;
  const differenceText = difference > 0 ? `+${difference}%` : `${difference}%`;
  const differenceColor = difference >= 0 ? "text-green-600" : "text-red-600";
  
  return (
    <div className="space-y-responsive-sm">
      <div className="flex justify-between text-responsive-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="relative">
        <div className="h-bar-responsive bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        {ritmoIdeal !== undefined && (
          <>
            {/* Marcador visual com ícone de relógio */}
            <div 
              className="absolute top-0 flex flex-col items-center transition-all duration-500 ease-out"
              style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)' }}
            >
              <div className="flex items-center gap-0.5">
                <Clock className="w-2 h-2 text-primary" />
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
              </div>
              <div className="w-0.5 h-bar-responsive bg-primary -mt-0.5" />
            </div>
            
            {/* Label sempre visível */}
            <div className="absolute -bottom-4 right-0 text-responsive-3xs font-medium whitespace-nowrap">
              <span className={differenceColor}>{differenceText}</span>
              <span className="text-muted-foreground ml-1">vs ideal</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

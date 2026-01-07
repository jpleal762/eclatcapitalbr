import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="space-y-1.5">
      <div className={`flex justify-between ${isTvMode ? 'text-base' : 'text-sm'}`}>
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="relative">
        <div className={`${isTvMode ? 'h-4' : 'h-3'} bg-muted rounded-full overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        {ritmoIdeal !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute top-0 flex flex-col items-center cursor-pointer transition-all duration-500 ease-out"
                  style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
                  <div className={`w-0.5 ${isTvMode ? 'h-4' : 'h-3'} bg-primary -mt-0.5`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Ritmo Ideal: {ritmoIdeal}%</p>
                  <p className={`text-sm font-bold ${differenceColor}`}>{differenceText}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
import { Clock } from "lucide-react";

interface ProgressBarProps {
  label: string;
  percentage: number;
  color?: "primary" | "muted";
  variant?: "default" | "gray";
  isTvMode?: boolean;
  ritmoIdeal?: number;
}

// Function to get clock style based on performance
const getClockStyle = (currentValue: number, idealValue: number) => {
  const percentageBelowIdeal = idealValue > 0 ? ((idealValue - currentValue) / idealValue) * 100 : 0;
  
  if (currentValue >= idealValue) {
    return { bgColor: 'bg-green-500', animate: false };
  } else if (percentageBelowIdeal > 30) {
    return { bgColor: 'bg-red-500', animate: true };
  } else {
    return { bgColor: 'bg-yellow-500', animate: true };
  }
};

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
  
  // Get clock style
  const clockStyle = ritmoIdeal !== undefined 
    ? getClockStyle(percentage, ritmoIdeal) 
    : { bgColor: 'bg-primary', animate: false };
  
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
              <div className={`flex items-center justify-center w-4 h-4 rounded-full shadow-md ${clockStyle.bgColor} ${clockStyle.animate ? 'animate-pulse-clock' : ''}`}>
                <Clock className="w-2.5 h-2.5 text-white" />
              </div>
              <div className={`w-0.5 h-bar-responsive -mt-0.5 ${clockStyle.bgColor}`} />
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

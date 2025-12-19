interface ProgressBarProps {
  label: string;
  percentage: number;
  color?: "primary" | "muted";
  variant?: "default" | "gray";
}

export function ProgressBar({ label, percentage, color = "primary", variant = "default" }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const getBarColor = () => {
    if (variant === "gray") return "bg-chart-dark";
    return color === "primary" ? "bg-primary" : "bg-chart-dark";
  };
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}

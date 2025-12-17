interface ProgressBarProps {
  label: string;
  percentage: number;
  color?: "primary" | "muted";
}

export function ProgressBar({ label, percentage, color = "primary" }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === "primary" ? "bg-primary" : "bg-chart-dark"
          }`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}

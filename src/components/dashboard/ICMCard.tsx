import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";

interface ICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
}

export function ICMCard({ icmGeral, ritmoIdeal, diasUteisRestantes }: ICMCardProps) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (Math.min(icmGeral, 100) / 100) * circumference;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-start justify-between gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">ICM Geral</h3>
          
          <div className="relative" style={{ width: 180, height: 100 }}>
            <svg width="180" height="100" viewBox="0 0 180 110">
              {/* Background arc */}
              <path
                d="M 10 100 A 80 80 0 0 1 170 100"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <path
                d="M 10 100 A 80 80 0 0 1 170 100"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-5xl font-bold text-foreground">{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining */}
        <div className="text-center px-4 py-2">
          <p className="text-sm text-muted-foreground mb-1">Dias Úteis<br/>Restantes</p>
          <p className="text-4xl font-bold text-foreground">{diasUteisRestantes}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-6 space-y-3">
        <ProgressBar label="Ritmo Ideal" percentage={ritmoIdeal} color="primary" />
        <ProgressBar label="ICM Geral" percentage={icmGeral} color="muted" />
      </div>
    </Card>
  );
}

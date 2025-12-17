import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessors: string[];
  selectedAssessor: string;
  selectedMonth: string;
  months: string[];
  onAssessorChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

export function ICMCard({
  icmGeral,
  ritmoIdeal,
  diasUteisRestantes,
  assessors,
  selectedAssessor,
  selectedMonth,
  months,
  onAssessorChange,
  onMonthChange,
}: ICMCardProps) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (Math.min(icmGeral, 100) / 100) * circumference;

  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${monthNames[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
  };

  return (
    <Card className="p-6 shadow-card">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={selectedAssessor} onValueChange={onAssessorChange}>
          <SelectTrigger className="w-[160px] bg-background text-sm">
            <SelectValue placeholder="TODOS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">TODOS (Escritório)</SelectItem>
            {assessors.map((a) => (
              <SelectItem key={a} value={a}>
                {a.split(" ").slice(0, 2).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[120px] bg-background text-sm">
            <SelectValue placeholder={getCurrentMonthLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start justify-between gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">ICM Geral</h3>
          
          <div className="relative" style={{ width: 180, height: 100 }}>
            <svg width="180" height="100" viewBox="0 0 180 110">
              <path
                d="M 10 100 A 80 80 0 0 1 170 100"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="14"
                strokeLinecap="round"
              />
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

      {/* Performance indicator */}
      {ritmoIdeal > icmGeral + 10 && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <span className="text-sm font-medium text-destructive">⚠️ Ritmo abaixo do esperado</span>
        </div>
      )}
      {icmGeral >= ritmoIdeal && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <span className="text-sm font-medium text-green-700">🎯 No ritmo ou acima da meta!</span>
        </div>
      )}
    </Card>
  );
}

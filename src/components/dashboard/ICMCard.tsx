import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useResponsiveSize } from "@/hooks/use-responsive-size";
import { useTheme } from "next-themes";
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
  onMonthChange
}: ICMCardProps) {
  const {
    height,
    scale
  } = useResponsiveSize();
  const { theme } = useTheme();

  // Dynamic gauge sizing - compacted for half height
  const dynamicScale = Math.max(0.7, Math.min(scale * 1.1, 1.6));
  const gaugeWidth = Math.round(140 * dynamicScale);
  const gaugeHeight = Math.round(80 * dynamicScale);
  const gaugeRadius = Math.round(60 * dynamicScale);
  const strokeWidth = Math.round(12 * dynamicScale);
  const circumference = Math.PI * gaugeRadius;
  const progress = Math.min(icmGeral, 100) / 100 * circumference;

  // Ritmo ideal marker calculations
  const ritmoIdealAngle = Math.PI - (ritmoIdeal / 100) * Math.PI;
  const centerX = gaugeWidth / 2;
  const centerY = gaugeHeight;
  const markerInnerRadius = gaugeRadius - strokeWidth / 2 - 2;
  const markerOuterRadius = gaugeRadius + strokeWidth / 2 + 2;

  const x1 = centerX + Math.cos(ritmoIdealAngle) * markerInnerRadius;
  const y1 = centerY - Math.sin(ritmoIdealAngle) * markerInnerRadius;
  const x2 = centerX + Math.cos(ritmoIdealAngle) * markerOuterRadius;
  const y2 = centerY - Math.sin(ritmoIdealAngle) * markerOuterRadius;

  // Triangle (arrow)
  const triangleSize = 4 * dynamicScale;
  const perpAngle = ritmoIdealAngle + Math.PI / 2;
  const tipX = x2;
  const tipY = y2;
  const baseX1 = x2 - Math.cos(ritmoIdealAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
  const baseY1 = y2 + Math.sin(ritmoIdealAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
  const baseX2 = x2 - Math.cos(ritmoIdealAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
  const baseY2 = y2 + Math.sin(ritmoIdealAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;

  // Cinza escuro no tema claro, cinza claro no tema escuro
  const markerColor = theme === "dark" ? "#D1D5DB" : "#4B5563";
  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${monthNames[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
  };
  return <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden">
      {/* Header compacto com filtros */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0 flex-wrap">
        <h3 className="text-responsive-sm font-semibold text-foreground">
          ICM Geral
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedAssessor} onValueChange={onAssessorChange}>
            <SelectTrigger className="w-[120px] bg-background text-responsive-xs h-7 py-0.5">
              <SelectValue placeholder="TODOS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">TODOS (Escritório)</SelectItem>
              {assessors.map(a => <SelectItem key={a} value={a}>
                  {a.split(" ").slice(0, 2).join(" ")}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[85px] bg-background text-responsive-xs h-7 py-0.5">
              <SelectValue placeholder={getCurrentMonthLabel()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>
                  {m.toUpperCase()}
                </SelectItem>)}
            </SelectContent>
          </Select>

        </div>
      </div>

      <div className="flex items-center justify-around gap-2 flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          
          <div className="relative" style={{
          width: gaugeWidth,
          height: gaugeHeight
        }}>
            <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight + 10}`}>
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{
              transition: "stroke-dashoffset 0.8s ease-out"
            }} />
              {/* Ritmo Ideal marker - linha + seta triangular */}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={markerColor} strokeWidth={2 * dynamicScale} />
              <polygon points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} fill={markerColor} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-responsive-2xl font-bold text-foreground">{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining + Ritmo Ideal */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-responsive-xs text-muted-foreground mb-1">Dias Úteis<br />Restantes</p>
            <p className="text-responsive-xl font-bold text-foreground">{diasUteisRestantes}</p>
          </div>
          <div className="text-center">
            <p className="text-responsive-xs text-muted-foreground mb-1">Ritmo<br />Ideal</p>
            <p className="text-responsive-xl font-bold text-foreground">{ritmoIdeal}%</p>
          </div>
        </div>
      </div>

      {/* Dynamic Performance Indicator */}
      <div className={`mt-1 py-1 px-2 rounded-md flex items-center justify-center gap-2 flex-shrink-0 ${icmGeral > ritmoIdeal ? 'bg-green-500/10 border border-green-500/20' : icmGeral === ritmoIdeal ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
        {icmGeral > ritmoIdeal && <>
            <CheckCircle className="icon-responsive-sm text-green-600" />
            <span className="text-responsive-xs font-medium text-green-700">Acima do esperado</span>
          </>}
        {icmGeral === ritmoIdeal && <>
            <Clock className="icon-responsive-sm text-blue-600" />
            <span className="text-responsive-xs font-medium text-blue-700">No Ritmo</span>
          </>}
        {icmGeral < ritmoIdeal && <>
            <AlertTriangle className="icon-responsive-sm text-orange-600" />
            <span className="text-responsive-xs font-medium text-orange-700">Abaixo do esperado</span>
          </>}
      </div>
    </Card>;
}
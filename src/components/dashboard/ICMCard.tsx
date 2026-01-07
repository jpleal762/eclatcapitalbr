import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useResponsiveSize } from "@/hooks/use-responsive-size";
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
  onToggleView?: () => void;
  isTvMode?: boolean;
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
  onToggleView,
  isTvMode = false
}: ICMCardProps) {
  const {
    height,
    scale
  } = useResponsiveSize();

  // Dynamic gauge sizing
  const dynamicScale = Math.max(0.6, Math.min(scale * (isTvMode ? 1.2 : 1), 1.4));
  const gaugeWidth = Math.round(140 * dynamicScale);
  const gaugeHeight = Math.round(80 * dynamicScale);
  const gaugeRadius = Math.round(60 * dynamicScale);
  const strokeWidth = Math.round(12 * dynamicScale);
  const circumference = Math.PI * gaugeRadius;
  const progress = Math.min(icmGeral, 100) / 100 * circumference;
  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${monthNames[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
  };
  return <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-responsive flex-shrink-0">
        <h3 className="text-responsive-xs font-medium text-muted-foreground">
          ICM Mensal
        </h3>
        {onToggleView && <Button variant="outline" size="sm" onClick={onToggleView} className="gap-1.5 text-responsive-xs h-auto py-1 px-2">
            <Calendar className="icon-responsive-sm" />
            {isTvMode ? "Mensal" : "TV"}
          </Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-responsive-sm mb-responsive flex-shrink-0">
        <Select value={selectedAssessor} onValueChange={onAssessorChange}>
          <SelectTrigger className="w-[140px] bg-background text-responsive-xs h-auto py-1">
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
          <SelectTrigger className="w-[100px] bg-background text-responsive-xs h-auto py-1">
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

      <div className="flex items-start justify-between gap-responsive flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center flex-1">
          <h3 className="text-responsive-sm font-semibold mb-responsive text-foreground">ICM Geral</h3>
          
          <div className="relative" style={{
          width: gaugeWidth,
          height: gaugeHeight
        }}>
            <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight + 10}`}>
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{
              transition: "stroke-dashoffset 0.8s ease-out"
            }} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-responsive-2xl font-bold text-foreground">{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining */}
        <div className="text-center px-responsive py-responsive-sm">
          <p className="text-responsive-xs text-muted-foreground mb-responsive-sm">Dias Úteis<br />Restantes</p>
          <p className="text-responsive-xl font-bold text-foreground">{diasUteisRestantes}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-auto pt-responsive space-y-responsive-sm flex-shrink-0">
        <div className="space-y-responsive-sm">
          <div className="flex justify-between text-responsive-xs">
            <span className="font-medium text-foreground">ICM Geral</span>
            <span className="font-bold text-foreground">{icmGeral}%</span>
          </div>
          <div className="relative">
            <div className="h-bar-responsive w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 bg-yellow-500" style={{
              width: `${Math.min(icmGeral, 100)}%`
            }} />
            </div>
            {/* Marcador do Ritmo Ideal */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-0 flex flex-col items-center cursor-pointer transition-all duration-500 ease-out" style={{
                  left: `${Math.min(ritmoIdeal, 100)}%`,
                  transform: 'translateX(-50%)'
                }}>
                    
                    
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="text-responsive-xs text-muted-foreground">Ritmo Ideal: {ritmoIdeal}%</p>
                    <p className={`text-responsive-sm font-bold ${icmGeral >= ritmoIdeal ? 'text-green-600' : 'text-red-600'}`}>
                      {icmGeral > ritmoIdeal ? `+${icmGeral - ritmoIdeal}%` : `${icmGeral - ritmoIdeal}%`}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
        </div>
      </div>

      {/* Dynamic Performance Indicator */}
      <div className={`mt-responsive p-responsive-sm rounded-lg flex items-center justify-center gap-responsive-sm flex-shrink-0 ${icmGeral > ritmoIdeal ? 'bg-green-500/10 border border-green-500/20' : icmGeral === ritmoIdeal ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
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
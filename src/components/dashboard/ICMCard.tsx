import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, Clock, AlertTriangle, Calendar, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { ReportButton } from "./ReportButton";
import { DashboardData } from "@/types/kpi";
import { EclatWeeklyActions, WeeklyAction } from "./EclatWeeklyActions";

interface HistoricalICMData {
  month: string;
  icmGeral: number;
  isCurrent?: boolean;
}

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
  isLocked?: boolean;
  historicalData?: HistoricalICMData[];
  dashboardData?: DashboardData;
  weeklyActions?: WeeklyAction[];
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
  isLocked = false,
  historicalData,
  dashboardData,
  weeklyActions = [],
}: ICMCardProps) {
  const { theme } = useTheme();

  // Fixed gauge dimensions - 5x increase for ICM Geral
  const gaugeWidth = 350;
  const gaugeHeight = 200;
  const gaugeRadius = 150;
  const strokeWidth = 30;
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

  // Triangle (arrow) - 5x increase
  const triangleSize = 10;
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
      {/* Header compacto com título e botão relatório */}
      <div className="flex items-center justify-between gap-2 mb-1 flex-shrink-0">
        <h3 className="text-responsive-lg font-semibold text-foreground flex items-center gap-1">
          ICM Geral <Gauge className="icon-responsive" />
        </h3>
        {dashboardData && (
          <ReportButton
            dashboardData={dashboardData}
            selectedAssessor={selectedAssessor}
            selectedMonth={selectedMonth}
            disabled={!dashboardData.gaugeKPIs?.length}
          />
        )}
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col gap-1 mb-2 flex-shrink-0">
        <Select value={selectedAssessor} onValueChange={onAssessorChange} disabled={isLocked}>
          <SelectTrigger className={`w-[120px] bg-background text-responsive-xs h-7 py-0.5 ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
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

      <div className="flex items-center justify-center gap-4 flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center justify-center">
          
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
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={markerColor} strokeWidth={2} />
              <polygon points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} fill={markerColor} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <span className="text-responsive-4xl font-bold text-foreground text-outline">{icmGeral}%</span>
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

      {/* Historical Performance - only when specific assessor is selected */}
      {selectedAssessor !== "all" && historicalData && historicalData.length > 0 && (
        <div className="flex flex-col items-center py-1.5 px-2 bg-muted/30 rounded-md flex-shrink-0">
          <span className="text-responsive-4xs text-muted-foreground mb-1">Histórico ICM</span>
          <div className="flex items-center justify-center gap-3">
            {historicalData.map((data) => (
              <div 
                key={data.month} 
                className={`flex flex-col items-center px-2 py-0.5 rounded ${
                  data.isCurrent 
                    ? 'bg-primary/10 border border-primary/30' 
                    : ''
                }`}
              >
                <span className="text-responsive-4xs text-muted-foreground uppercase">
                  {data.month}
                </span>
                <span 
                  className={`text-responsive-sm font-bold ${
                    data.isCurrent 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}
                >
                  {data.icmGeral}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
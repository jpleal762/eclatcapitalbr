import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Dynamic gauge sizing - compacted for half height
  const dynamicScale = Math.max(0.7, Math.min(scale * (isTvMode ? 1.4 : 1.1), 1.6));
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
  return <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden">
      {/* Header compacto com filtros */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0 flex-wrap">
        <h3 className={`${isTvMode ? 'text-tv-lg' : 'text-responsive-sm'} font-semibold text-foreground`}>
          ICM Mensal
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

          {onToggleView && <Button variant="outline" size="sm" onClick={onToggleView} className="gap-1.5 text-responsive-xs h-7 py-0.5 px-2">
              <Calendar className="icon-responsive-sm" />
              {isTvMode ? "Mensal" : "TV"}
            </Button>}
        </div>
      </div>

      <div className="flex items-center justify-around gap-2 flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          
          <div className="relative" style={{
          width: gaugeWidth + 30,
          height: gaugeHeight + 20
        }}>
            <svg width={gaugeWidth + 30} height={gaugeHeight + 20} viewBox={`-15 -15 ${gaugeWidth + 30} ${gaugeHeight + 20}`}>
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{
              transition: "stroke-dashoffset 0.8s ease-out"
            }} />
              
              {/* Marcador de Ritmo Ideal */}
              {(() => {
                const ritmoAngle = Math.PI - (ritmoIdeal / 100) * Math.PI;
                const centerX = gaugeWidth / 2;
                const centerY = gaugeHeight;
                const markerInnerRadius = gaugeRadius - strokeWidth / 2 - 2;
                const markerOuterRadius = gaugeRadius + strokeWidth / 2 + 2;
                
                const x1 = centerX + Math.cos(ritmoAngle) * markerInnerRadius;
                const y1 = centerY - Math.sin(ritmoAngle) * markerInnerRadius;
                const x2 = centerX + Math.cos(ritmoAngle) * markerOuterRadius;
                const y2 = centerY - Math.sin(ritmoAngle) * markerOuterRadius;
                
                // Triângulo apontando para dentro
                const triangleSize = 3 * dynamicScale;
                const perpAngle = ritmoAngle + Math.PI / 2;
                const tipX = x2;
                const tipY = y2;
                const baseX1 = x2 - Math.cos(ritmoAngle) * triangleSize + Math.cos(perpAngle) * triangleSize * 0.6;
                const baseY1 = y2 + Math.sin(ritmoAngle) * triangleSize - Math.sin(perpAngle) * triangleSize * 0.6;
                const baseX2 = x2 - Math.cos(ritmoAngle) * triangleSize - Math.cos(perpAngle) * triangleSize * 0.6;
                const baseY2 = y2 + Math.sin(ritmoAngle) * triangleSize + Math.sin(perpAngle) * triangleSize * 0.6;
                
                // Posição do relógio
                const clockOffset = (strokeWidth / 2) + 5 * dynamicScale;
                const clockX = centerX + Math.cos(ritmoAngle) * (gaugeRadius + clockOffset);
                const clockY = centerY - Math.sin(ritmoAngle) * (gaugeRadius + clockOffset);
                const clockSize = 6 * dynamicScale;
                
                const clockColor = '#374151'; // gray-700
                
                return (
                  <g>
                    {/* Linha do marcador */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={clockColor} strokeWidth={2 * dynamicScale} />
                    {/* Triângulo */}
                    <polygon points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} fill={clockColor} />
                    {/* Círculo do relógio */}
                    <circle cx={clockX} cy={clockY} r={clockSize} fill={clockColor} />
                    {/* Bordinha branca */}
                    <circle cx={clockX} cy={clockY} r={clockSize * 0.75} fill="none" stroke="white" strokeWidth={0.8 * dynamicScale} />
                    {/* Ponteiros */}
                    <line x1={clockX} y1={clockY} x2={clockX} y2={clockY - clockSize * 0.45} stroke="white" strokeWidth={0.8 * dynamicScale} strokeLinecap="round" />
                    <line x1={clockX} y1={clockY} x2={clockX + clockSize * 0.35} y2={clockY} stroke="white" strokeWidth={0.8 * dynamicScale} strokeLinecap="round" />
                    {/* Ponto central */}
                    <circle cx={clockX} cy={clockY} r={0.6 * dynamicScale} fill="white" />
                  </g>
                );
              })()}
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-responsive-2xl font-bold text-foreground">{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining */}
        <div className="text-center">
          <p className="text-responsive-xs text-muted-foreground mb-1">Dias Úteis<br />Restantes</p>
          <p className="text-responsive-xl font-bold text-foreground">{diasUteisRestantes}</p>
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
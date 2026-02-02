import { QuarterlyKPI, MonthlyGapData } from "@/lib/quarterlyKpiUtils";

interface QuarterlyKPIBarProps extends QuarterlyKPI {
  ritmoIdeal: number;
  headName?: string;
  isTopGap?: boolean;
  monthlyGaps?: MonthlyGapData[];
}

// Format value for display
function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}Mi`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString("pt-BR")}`;
  }
  return value.toLocaleString("pt-BR");
}

// Format gap value compactly
function formatGapValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1000000) {
      return `-${(value / 1000000).toFixed(1).replace(".", ",")}Mi`;
    }
    if (value >= 1000) {
      return `-${(value / 1000).toFixed(0)}K`;
    }
    return `-${value.toLocaleString("pt-BR")}`;
  }
  return `-${value.toLocaleString("pt-BR")}`;
}

// Get color class based on percentage vs ritmo ideal
function getBarColor(percentage: number, ritmoIdeal: number): string {
  if (ritmoIdeal <= 0) return "bg-green-500"; // Trimestre futuro

  if (percentage >= ritmoIdeal) return "bg-green-500";
  if (percentage >= ritmoIdeal * 0.5) return "bg-eclat-gradient-horizontal";
  return "bg-red-500";
}
function getTextColor(percentage: number, ritmoIdeal: number): string {
  if (ritmoIdeal <= 0) return "text-green-600 dark:text-green-400"; // Trimestre futuro

  if (percentage >= ritmoIdeal) return "text-green-600 dark:text-green-400";
  if (percentage >= ritmoIdeal * 0.5) return "text-eclat-gold";
  return "text-red-600 dark:text-red-400";
}
export function QuarterlyKPIBar({
  label,
  value,
  target,
  percentage,
  isCurrency,
  ritmoIdeal,
  headName,
  isTopGap,
  monthlyGaps
}: QuarterlyKPIBarProps) {
  const barWidth = Math.min(percentage, 100);
  const barColor = getBarColor(percentage, ritmoIdeal);
  const textColor = getTextColor(percentage, ritmoIdeal);

  // Calculate expected value at ideal rhythm and how much is missing
  const valorEsperadoRitmo = target * (ritmoIdeal / 100);
  const faltaParaRitmo = Math.max(0, valorEsperadoRitmo - value);
  const atingiuRitmo = percentage >= ritmoIdeal;
  return <div className="bg-card rounded-lg p-[3px] lg:p-1 h-full flex flex-col border border-border shadow-sm overflow-hidden">
      {/* Label and percentage - compact */}
      <div className="flex justify-between items-center mb-[1px]">
        <div className="flex items-center gap-0.5">
          <span className="font-semibold text-foreground text-scale-11 lg:text-scale-12 truncate">{label}</span>
          {headName && <span className="inline-flex items-center text-scale-4 lg:text-scale-5 font-bold text-eclat-gold uppercase tracking-wide bg-yellow-500/10 px-[1px] py-[1px] rounded border border-yellow-500/20">
              HEAD {headName}
            </span>}
          {isTopGap && <span className="inline-flex items-center text-scale-4 lg:text-scale-5 font-bold text-red-500 animate-pulse">
              ⚠️ PRIORIDADE
            </span>}
        </div>
        <span className={`font-bold text-scale-6 lg:text-scale-7 ${textColor}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar - 2x height */}
      <div className="relative h-scale-2 lg:h-scale-3 my-[1px]">
        {/* Actual progress bar */}
        <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
          <div className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500 ease-out rounded-full`} style={{
          width: `${barWidth}%`
        }} />
          {/* Month dividers (3 equal parts) */}
          <div className="absolute top-0 h-full w-px bg-foreground/20" style={{
          left: "33.33%"
        }} />
          <div className="absolute top-0 h-full w-px bg-foreground/20" style={{
          left: "66.66%"
        }} />
        </div>
        
        {/* Ideal Rhythm Marker - line only, no text below */}
        {ritmoIdeal > 0 && ritmoIdeal <= 100 && <div className="absolute top-0 h-full flex flex-col items-center z-10" style={{
        left: `${ritmoIdeal}%`,
        transform: "translateX(-50%)"
      }}>
            {/* Vertical blue line */}
            <div className="flex-1 w-[1px] bg-blue-500" />
            {/* Triangle pointing down */}
            <div className="w-0 h-0 border-l-[1.5px] border-l-transparent border-r-[1.5px] border-r-transparent border-t-[2px] border-t-blue-500" />
          </div>}
      </div>
      
      {/* Monthly Gap Indicators - below the bar */}
      {monthlyGaps && monthlyGaps.some(g => g.showGap) && (
        <div className="relative h-scale-1.5 lg:h-scale-2">
          {monthlyGaps.map((gap, idx) => (
            gap.showGap && (
              <div 
                key={idx}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${gap.position}%`,
                  transform: "translateX(-50%)",
                  top: 0
                }}
              >
                <span className="text-scale-5 lg:text-scale-6 font-semibold text-muted-foreground whitespace-nowrap">
                  {formatGapValue(gap.cumulativeGap, gap.isCurrency)}
                </span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Values - compact font */}
      <div className="flex justify-between items-center text-scale-5 text-muted-foreground mt-[1px]">
        <span>
          <span className="font-medium text-foreground">{formatValue(value, isCurrency)}</span>
          {" / "}
          {formatValue(target, isCurrency)}
        </span>
        
        {/* Rhythm status indicator */}
        {atingiuRitmo ? <span className="text-green-500 font-medium">✓ OK</span> : faltaParaRitmo > 0 ? <span className={`font-medium whitespace-nowrap ${textColor.includes("red") ? "text-red-500" : "text-blue-500"}`}>
            {textColor.includes("red") && "! "}Ritmo: -{formatValue(faltaParaRitmo, isCurrency)}
          </span> : null}
        
        {/* Total remaining */}
        {percentage < 100 && target > 0 && <span className="text-muted-foreground whitespace-nowrap">
            Falta: {formatValue(target - value, isCurrency)}
          </span>}
      </div>
    </div>;
}
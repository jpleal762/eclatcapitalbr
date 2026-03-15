import { ProcessedKPI, AssessorPerformance, GaugeKPI } from "@/types/kpi";
import { formatNumber, filterByAssessor, filterByCategory, getMonthValue, calculateICMGeral } from "@/lib/kpiUtils";

interface TVScreen3Props {
  processedData: ProcessedKPI[];
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
  ritmoIdeal: number;
  selectedMonth: string;
}

function getStatusColor(pct: number, ritmo: number) {
  if (pct >= ritmo) return { text: "text-tv-green", bg: "bg-tv-green/10 border-tv-green/20" };
  if (pct >= ritmo * 0.7) return { text: "text-tv-yellow", bg: "bg-tv-yellow/10 border-tv-yellow/20" };
  if (pct < ritmo * 0.25) return { text: "text-tv-red", bg: "bg-tv-red/10 border-tv-red/20" };
  return { text: "text-tv-text", bg: "bg-tv-card border-tv-border" };
}

const KPI_COLS = [
  { label: "Diagnóst.", cat: "Primeira reuniao", actualCat: "Primeira reuniao", isCurrency: false },
  { label: "Habilit.", cat: "Habilitacao", actualCat: "Habilitacao", isCurrency: false },
  { label: "Ativação", cat: "Ativacao", actualCat: "Ativacao", isCurrency: false },
  { label: "Captação", cat: "Captação net", actualCat: "Captação net", isCurrency: true },
  { label: "Receita", cat: "Receita", actualCat: "Receita", isCurrency: true },
];

function getAssessorKPIValue(data: ProcessedKPI[], assessor: string, category: string, month: string, status = "realizado"): number {
  const aData = filterByAssessor(data, assessor);
  const cData = filterByCategory(aData, category);
  const filtered = cData.filter(d => d.status.toLowerCase().includes(status.toLowerCase().trim()));
  return getMonthValue(filtered, month);
}

function getAssessorKPITarget(data: ProcessedKPI[], assessor: string, category: string, month: string): number {
  const aData = filterByAssessor(data, assessor);
  const cData = filterByCategory(aData, category);
  const planned = cData.filter(d => {
    const s = d.status.toLowerCase();
    return s.includes("planejado m") || s === "planejado mês";
  });
  return getMonthValue(planned, month);
}

function getPrincipalGap(data: ProcessedKPI[], assessor: string, month: string, ritmoIdeal: number): string {
  const kpiChecks = KPI_COLS;
  let worstLabel = "";
  let worstRatio = Infinity;

  for (const kpi of kpiChecks) {
    const target = getAssessorKPITarget(data, assessor, kpi.cat, month);
    if (target <= 0) continue;
    const value = getAssessorKPIValue(data, assessor, kpi.cat, month);
    const pct = (value / target) * 100;
    const ratio = ritmoIdeal > 0 ? pct / ritmoIdeal : pct;
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worstLabel = kpi.label;
    }
  }
  return worstLabel;
}

export function TVScreen3({ processedData, assessorPerformance, gaugeKPIs, ritmoIdeal, selectedMonth }: TVScreen3Props) {
  const sortedAssessors = [...assessorPerformance].sort((a, b) => b.geralPercentage - a.geralPercentage);

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-black text-tv-text tracking-tight">Performance por Assessor</h2>
        <div className="flex items-center gap-5 text-sm text-tv-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-tv-green inline-block" /> No ritmo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-tv-yellow inline-block" /> Atenção
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-tv-red inline-block" /> Crítico
          </span>
        </div>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-[200px_90px_repeat(5,1fr)_130px] gap-3 items-center px-5 flex-shrink-0">
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">Assessor</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-center">ICM</span>
        {KPI_COLS.map(c => (
          <span key={c.label} className="text-sm font-bold text-tv-muted uppercase tracking-wider text-center">{c.label}</span>
        ))}
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-center">Gap Principal</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-2">
        {sortedAssessors.map((a, idx) => {
          const colors = getStatusColor(a.geralPercentage, ritmoIdeal);
          const principalGap = getPrincipalGap(processedData, a.fullName || a.name, selectedMonth, ritmoIdeal);
          const isLeader = idx === 0;

          return (
            <div
              key={a.fullName}
              className={`grid grid-cols-[200px_90px_repeat(5,1fr)_130px] gap-3 items-center px-5 py-4 rounded-2xl border transition-all ${
                isLeader ? "bg-tv-gold/8 border-tv-gold/30" : colors.bg
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-2">
                {isLeader && <span className="text-tv-gold text-base">🏆</span>}
                <span className={`text-base font-semibold truncate ${isLeader ? "text-tv-gold" : "text-tv-text"}`}>
                  {a.name}
                </span>
              </div>

              {/* ICM */}
              <span className={`text-lg font-black tabular-nums text-center ${colors.text}`}>
                {a.geralPercentage}%
              </span>

              {/* KPI values */}
              {KPI_COLS.map(kpi => {
                const assessorFullName = a.fullName || a.name;
                const val = getAssessorKPIValue(processedData, assessorFullName, kpi.cat, selectedMonth);
                const target = getAssessorKPITarget(processedData, assessorFullName, kpi.cat, selectedMonth);
                const pct = target > 0 ? Math.round((val / target) * 100) : 0;
                const kpiColors = getStatusColor(pct, ritmoIdeal);
                return (
                  <div key={kpi.label} className="flex flex-col items-center">
                    <span className={`text-base font-bold tabular-nums ${target > 0 ? kpiColors.text : "text-tv-muted"}`}>
                      {formatNumber(val, kpi.isCurrency)}
                    </span>
                    {target > 0 && (
                      <span className="text-xs text-tv-muted tabular-nums">/{formatNumber(target, kpi.isCurrency)}</span>
                    )}
                  </div>
                );
              })}

              {/* Principal gap */}
              <div className="text-center">
                {principalGap ? (
                  <span className="text-sm font-semibold text-tv-red bg-tv-red/10 border border-tv-red/20 px-2 py-1 rounded-full">
                    {principalGap}
                  </span>
                ) : (
                  <span className="text-base text-tv-green">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

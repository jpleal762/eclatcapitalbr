import { GaugeKPI } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TVScreen2Props {
  gaugeKPIs: GaugeKPI[];
  ritmoIdeal: number;
}

function getStatusColor(pct: number, ritmo: number) {
  if (pct >= ritmo) return { bar: "bg-tv-green", text: "text-tv-green", badge: "bg-tv-green/15 text-tv-green border-tv-green/30" };
  const diff = ritmo - pct;
  if (diff <= 10) return { bar: "bg-tv-yellow", text: "text-tv-yellow", badge: "bg-tv-yellow/15 text-tv-yellow border-tv-yellow/30" };
  return { bar: "bg-tv-red", text: "text-tv-red", badge: "bg-tv-red/15 text-tv-red border-tv-red/30" };
}

export function TVScreen2({ gaugeKPIs, ritmoIdeal }: TVScreen2Props) {
  // Sort worst first
  const sorted = [...gaugeKPIs]
    .filter(k => k.target > 0)
    .sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-black text-tv-text tracking-tight">Performance dos KPIs</h2>
        <div className="flex items-center gap-3 text-sm text-tv-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-white/40" /> <span>Ritmo Ideal ({ritmoIdeal}%)</span>
          </div>
          <span>· Ordem: pior primeiro</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[220px_1fr_90px_150px_150px_150px] gap-4 items-center px-5 flex-shrink-0">
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">KPI</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">Progresso</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">%</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Realizado</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Meta</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Gap</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 pr-2">
        {sorted.map((kpi, idx) => {
          const colors = getStatusColor(kpi.percentage, ritmoIdeal);
          const gap = Math.max(kpi.target - kpi.value, 0);
          const clampedPct = Math.min(kpi.percentage, 100);
          const ritmoClamp = Math.min(ritmoIdeal, 100);

          return (
            <div
              key={kpi.label}
              className={`grid grid-cols-[220px_1fr_90px_150px_150px_150px] gap-4 items-center px-5 py-4 rounded-2xl bg-tv-card border border-tv-border transition-all ${
                idx === 0 ? "border-tv-red/40 shadow-sm" : ""
              }`}
            >
              {/* KPI Name */}
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${colors.badge}`}>
                  {idx + 1}
                </span>
                <span className="text-base font-semibold text-tv-text truncate">{kpi.label}</span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-5 bg-tv-border rounded-full overflow-visible">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
                {/* Ritmo marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50 rounded"
                  style={{ left: `${ritmoClamp}%` }}
                />
              </div>

              {/* Percentage */}
              <span className={`text-lg font-black tabular-nums text-right ${colors.text}`}>
                {kpi.percentage}%
              </span>

              {/* Realized */}
              <span className="text-base font-semibold text-tv-text text-right tabular-nums">
                {formatNumber(kpi.value, kpi.isCurrency)}
              </span>

              {/* Target */}
              <span className="text-base text-tv-muted text-right tabular-nums">
                {formatNumber(kpi.target, kpi.isCurrency)}
              </span>

              {/* Gap */}
              <span className={`text-base font-bold text-right tabular-nums ${gap > 0 ? colors.text : "text-tv-green"}`}>
                {gap > 0 ? `-${formatNumber(gap, kpi.isCurrency)}` : "✓"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

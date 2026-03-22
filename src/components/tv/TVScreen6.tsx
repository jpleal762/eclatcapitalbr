import React from "react";
import { ProcessedKPI } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import {
  processQuarterlyDashboardData,
  calculateQuarterlyIdealRhythm,
  QUARTERS,
} from "@/lib/quarterlyKpiUtils";
import { BarChart3, CheckCircle, AlertTriangle } from "lucide-react";

interface TVScreen6Props {
  processedData: ProcessedKPI[];
}

function getStatusColor(pct: number, ritmo: number) {
  if (pct >= ritmo) return { text: "text-tv-green", bar: "bg-tv-green", badge: "bg-tv-green/15 border-tv-green/30 text-tv-green" };
  if (pct >= ritmo * 0.5) return { text: "text-tv-yellow", bar: "bg-tv-yellow", badge: "bg-tv-yellow/15 border-tv-yellow/30 text-tv-yellow" };
  return { text: "text-tv-red", bar: "bg-tv-red", badge: "bg-tv-red/15 border-tv-red/30 text-tv-red" };
}

function getCurrentQuarter(): { value: string; label: string; year: number } {
  const now = new Date();
  const month = now.getMonth(); // 0-based
  const year = now.getFullYear();
  if (month <= 2) return { value: "Q1", label: "Q1 (Jan–Mar)", year };
  if (month <= 5) return { value: "Q2", label: "Q2 (Abr–Jun)", year };
  if (month <= 8) return { value: "Q3", label: "Q3 (Jul–Set)", year };
  return { value: "Q4", label: "Q4 (Out–Dez)", year };
}

export function TVScreen6({ processedData }: TVScreen6Props) {
  const { value: quarterValue, label: quarterLabel, year } = getCurrentQuarter();
  const ritmoIdeal = calculateQuarterlyIdealRhythm(year, quarterValue);
  const kpis = processQuarterlyDashboardData(processedData, year, quarterValue, "all");

  const sorted = [...kpis].filter(k => k.target > 0).sort((a, b) => a.percentage - b.percentage);
  const onTrack = sorted.filter(k => k.percentage >= ritmoIdeal).length;
  const total = sorted.length;

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-tv-gold" />
          <h2 className="text-2xl font-black text-tv-text tracking-tight">Planejamento Trimestral</h2>
          <span className="px-3 py-1 rounded-full bg-tv-gold/20 border border-tv-gold/40 text-tv-gold text-sm font-bold uppercase">
            {quarterLabel}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-tv-green" />
            <span className="text-tv-green font-semibold">{onTrack} no ritmo</span>
            <span className="text-tv-muted">de {total} KPIs</span>
          </div>
          <span className="text-sm text-tv-muted border-l border-tv-border pl-4">
            Ritmo Ideal: <span className="text-tv-text font-bold">{ritmoIdeal}%</span>
          </span>
        </div>
      </div>

      {/* Quarter months strip */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {QUARTERS.find(q => q.value === quarterValue)?.months.map((m, i) => {
          const now = new Date();
          const qDef = QUARTERS.find(q => q.value === quarterValue)!;
          const monthIdx = qDef.startMonth + i;
          const isPast = monthIdx < now.getMonth();
          const isCurrent = monthIdx === now.getMonth() && year === now.getFullYear();
          return (
            <div
              key={m}
              className={`flex items-center justify-center py-3 rounded-xl border ${
                isCurrent
                  ? "bg-tv-gold/15 border-tv-gold/50"
                  : isPast
                  ? "bg-tv-card border-tv-border opacity-60"
                  : "bg-tv-card border-tv-border"
              }`}
            >
              <span className={`text-lg font-bold uppercase ${isCurrent ? "text-tv-gold" : "text-tv-muted"}`}>
                {m.toUpperCase()}
                {isCurrent && <span className="ml-2 text-[11px] text-tv-gold/70 font-medium tracking-widest">← atual</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[220px_1fr_90px_160px_160px_160px] gap-4 items-center px-5 flex-shrink-0">
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">KPI</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">Progresso Trimestral</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">%</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Realizado</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Meta Trim.</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Gap</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 pr-2">
        {sorted.map((kpi, idx) => {
          const colors = getStatusColor(kpi.percentage, ritmoIdeal);
          const gap = Math.max(kpi.target - kpi.value, 0);
          const achieved = gap <= 0;
          const clampedPct = Math.min(kpi.percentage, 100);
          const ritmoClamp = Math.min(ritmoIdeal, 100);

          return (
            <div
              key={kpi.label}
              className={`grid grid-cols-[220px_1fr_90px_160px_160px_160px] gap-4 items-center px-5 py-4 rounded-2xl bg-tv-card border transition-all ${
                idx === 0 && !achieved ? "border-tv-red/50 shadow-sm" : achieved ? "border-tv-green/30" : "border-tv-border"
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${colors.badge}`}>
                  {idx + 1}
                </span>
                <span className="text-base font-semibold text-tv-text truncate">{kpi.label}</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-5 bg-tv-border rounded-full overflow-visible">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
                {/* Quarter month markers at 33% and 66% */}
                <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: "33.33%" }} />
                <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: "66.66%" }} />
                {/* Ritmo marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded"
                  style={{ left: `${ritmoClamp}%` }}
                />
              </div>

              {/* % */}
              <span className={`text-lg font-black tabular-nums text-right ${colors.text}`}>{kpi.percentage}%</span>

              {/* Realized */}
              <span className="text-base font-semibold text-tv-text text-right tabular-nums">
                {formatNumber(kpi.value, kpi.isCurrency)}
              </span>

              {/* Target */}
              <span className="text-base text-tv-muted text-right tabular-nums">
                {formatNumber(kpi.target, kpi.isCurrency)}
              </span>

              {/* Gap */}
              <span className={`text-base font-bold text-right tabular-nums ${achieved ? "text-tv-green" : colors.text}`}>
                {achieved ? "✓" : `-${formatNumber(gap, kpi.isCurrency)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

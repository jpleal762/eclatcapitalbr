import React from "react";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { Target, CheckCircle, TrendingUp, Calendar } from "lucide-react";

interface TVScreen5Props {
  metaSemanal: MetaSemanal[];
  ritmoIdeal: number;
  selectedMonth: string;
  totalDiasUteis: number;
  diasUteisDecorridos: number;
}

function getStatusColor(pct: number, ritmo: number) {
  if (pct >= ritmo) return { text: "text-tv-green", bar: "bg-tv-green", badge: "bg-tv-green/15 border-tv-green/30 text-tv-green" };
  const diff = ritmo - pct;
  if (diff <= 15) return { text: "text-tv-yellow", bar: "bg-tv-yellow", badge: "bg-tv-yellow/15 border-tv-yellow/30 text-tv-yellow" };
  return { text: "text-tv-red", bar: "bg-tv-red", badge: "bg-tv-red/15 border-tv-red/30 text-tv-red" };
}

export function TVScreen5({ metaSemanal, ritmoIdeal, selectedMonth, totalDiasUteis, diasUteisDecorridos }: TVScreen5Props) {
  const items = metaSemanal.filter(m => m.monthlyTarget && m.monthlyTarget > 0);
  const semanasPorMes = 4;
  const semanaAtual = Math.ceil((diasUteisDecorridos / (totalDiasUteis || 1)) * semanasPorMes);

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="w-7 h-7 text-tv-gold" />
          <h2 className="text-2xl font-black text-tv-text tracking-tight">Planejamento Semanal</h2>
          <span className="px-3 py-1 rounded-full bg-tv-gold/20 border border-tv-gold/40 text-tv-gold text-sm font-bold uppercase">
            {selectedMonth.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-tv-muted">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tv-green inline-block" />
            <span>No ritmo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tv-yellow inline-block" />
            <span>Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tv-red inline-block" />
            <span>Crítico</span>
          </div>
          <span className="text-tv-muted border-l border-tv-border pl-4">
            Ritmo Ideal: <span className="text-tv-text font-bold">{ritmoIdeal}%</span>
          </span>
        </div>
      </div>

      {/* Weeks summary strip */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[1, 2, 3, 4].map(w => (
          <div
            key={w}
            className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
              w === semanaAtual
                ? "bg-tv-gold/15 border-tv-gold/50 shadow-[0_0_16px_rgba(255,191,0,0.15)]"
                : w < semanaAtual
                ? "bg-tv-card border-tv-border opacity-60"
                : "bg-tv-card border-tv-border"
            }`}
          >
            <span className="text-xs text-tv-muted uppercase tracking-widest font-medium">Semana</span>
            <span className={`text-2xl font-black ${w === semanaAtual ? "text-tv-gold" : "text-tv-muted"}`}>{w}</span>
            {w === semanaAtual && (
              <span className="text-[10px] text-tv-gold font-bold uppercase tracking-wider mt-0.5">Atual</span>
            )}
          </div>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-[220px_1fr_130px_130px_130px_130px] gap-3 items-center px-5 flex-shrink-0">
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">KPI</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider">Progresso Mês</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">% Mês</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Realizado</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Meta Mês</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-wider text-right">Falta</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 pr-2">
        {items.map((item, idx) => {
          const realized = item.realizedValue ?? 0;
          const monthlyTarget = item.monthlyTarget!;
          const pct = monthlyTarget > 0 ? Math.round((realized / monthlyTarget) * 100) : 0;
          const remaining = Math.max(monthlyTarget - realized, 0);
          const achieved = remaining <= 0;
          const colors = getStatusColor(pct, ritmoIdeal);
          const clampedPct = Math.min(pct, 100);
          const ritmoClamp = Math.min(ritmoIdeal, 100);

          return (
            <div
              key={item.label}
              className={`grid grid-cols-[220px_1fr_130px_130px_130px_130px] gap-3 items-center px-5 py-4 rounded-2xl bg-tv-card border transition-all ${
                achieved ? "border-tv-green/30" : idx === 0 ? "border-tv-red/40" : "border-tv-border"
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-2">
                {achieved && <CheckCircle className="w-4 h-4 text-tv-green flex-shrink-0" />}
                <span className="text-base font-semibold text-tv-text truncate">{item.label}</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-5 bg-tv-border rounded-full overflow-visible">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50 rounded"
                  style={{ left: `${ritmoClamp}%` }}
                />
              </div>

              {/* % */}
              <span className={`text-lg font-black tabular-nums text-right ${colors.text}`}>{pct}%</span>

              {/* Realized */}
              <span className="text-base font-semibold text-tv-text text-right tabular-nums">
                {formatNumber(realized, item.isCurrency)}
              </span>

              {/* Target */}
              <span className="text-base text-tv-muted text-right tabular-nums">
                {formatNumber(monthlyTarget, item.isCurrency)}
              </span>

              {/* Remaining */}
              <span className={`text-base font-bold text-right tabular-nums ${achieved ? "text-tv-green" : colors.text}`}>
                {achieved ? "✓ Atingido" : `-${formatNumber(remaining, item.isCurrency)}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer: meta do dia */}
      <div className="flex-shrink-0 bg-tv-card border border-tv-border rounded-2xl px-5 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-tv-gold" />
          <span className="text-sm font-bold text-tv-gold uppercase tracking-wider">Meta Diária Restante</span>
        </div>
        <div className="flex gap-6 flex-1">
          {items.slice(0, 5).map(item => {
            const diasRestantes = Math.max(totalDiasUteis - diasUteisDecorridos, 1);
            const remaining = Math.max((item.monthlyTarget ?? 0) - (item.realizedValue ?? 0), 0);
            const perDay = Math.ceil(remaining / diasRestantes);
            return (
              <div key={item.label} className="flex flex-col items-center min-w-0">
                <span className="text-xs text-tv-muted truncate max-w-[110px] text-center">{item.label}</span>
                <span className="text-base font-bold text-tv-text">
                  {formatNumber(perDay, item.isCurrency)}<span className="text-tv-muted text-xs">/dia</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-l border-tv-border pl-5">
          <TrendingUp className="w-4 h-4 text-tv-muted" />
          <span className="text-sm text-tv-muted">Dias úteis restantes: <span className="text-tv-text font-bold">{Math.max(totalDiasUteis - diasUteisDecorridos, 0)}</span></span>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { CheckCircle, TrendingUp, Calendar } from "lucide-react";

interface TVScreen5Props {
  metaSemanal: MetaSemanal[];
  ritmoIdeal: number;
  selectedMonth: string;
  totalDiasUteis: number;
  diasUteisDecorridos: number;
}

function getStatusColor(pct: number, ritmo: number) {
  if (pct >= ritmo) return { text: "text-tv-green", bar: "bg-tv-green", badge: "bg-tv-green/15 border-tv-green/30 text-tv-green", row: "border-tv-green/25" };
  const diff = ritmo - pct;
  if (diff <= 15) return { text: "text-tv-yellow", bar: "bg-tv-yellow", badge: "bg-tv-yellow/15 border-tv-yellow/30 text-tv-yellow", row: "border-tv-yellow/20" };
  return { text: "text-tv-red", bar: "bg-tv-red", badge: "bg-tv-red/15 border-tv-red/30 text-tv-red", row: "border-tv-red/30 bg-tv-red/5" };
}

export function TVScreen5({ metaSemanal, ritmoIdeal, selectedMonth, totalDiasUteis, diasUteisDecorridos }: TVScreen5Props) {
  const items = metaSemanal.filter(m => m.monthlyTarget && m.monthlyTarget > 0);
  const semanasPorMes = 4;
  const semanaAtual = Math.ceil((diasUteisDecorridos / (totalDiasUteis || 1)) * semanasPorMes);
  const diasRestantes = Math.max(totalDiasUteis - diasUteisDecorridos, 1);

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(220 60% 12%) 0%, hsl(220 50% 8%) 100%)" }}
    >
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b"
        style={{ borderColor: "hsl(220 50% 20%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(220 80% 50% / 0.25)", border: "1px solid hsl(220 80% 60% / 0.4)" }}
          >
            <Calendar className="w-5 h-5" style={{ color: "hsl(220 80% 70%)" }} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "hsl(0 0% 97%)" }}>
              Planejamento Semanal
            </h2>
            <p className="text-sm" style={{ color: "hsl(220 40% 60%)" }}>Progresso do mês em andamento</p>
          </div>
          <span className="ml-2 px-3 py-1 rounded-full text-sm font-bold uppercase"
            style={{ background: "hsl(220 80% 50% / 0.2)", border: "1px solid hsl(220 80% 60% / 0.4)", color: "hsl(220 80% 75%)" }}
          >
            {selectedMonth.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <LegendDot color="hsl(142 70% 45%)" label="No ritmo" />
          <LegendDot color="hsl(38 92% 50%)" label="Atenção" />
          <LegendDot color="hsl(0 84% 60%)" label="Crítico" />
          <span className="border-l pl-4" style={{ borderColor: "hsl(220 40% 25%)", color: "hsl(220 40% 55%)" }}>
            Ritmo Ideal: <span className="font-bold" style={{ color: "hsl(0 0% 90%)" }}>{ritmoIdeal}%</span>
          </span>
        </div>
      </div>

      {/* ─── SEMANA ATUAL STRIP ─── */}
      <div className="grid grid-cols-4 gap-3 px-6 py-3 flex-shrink-0">
        {[1, 2, 3, 4].map(w => (
          <div
            key={w}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl transition-all"
            style={{
              background: w === semanaAtual
                ? "hsl(220 80% 50% / 0.2)"
                : "hsl(220 40% 12% / 0.5)",
              border: `1px solid ${w === semanaAtual ? "hsl(220 80% 60% / 0.5)" : "hsl(220 30% 20%)"}`,
              boxShadow: w === semanaAtual ? "0 0 16px hsl(220 80% 50% / 0.2)" : "none",
              opacity: w < semanaAtual ? 0.55 : 1,
            }}
          >
            <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "hsl(220 40% 55%)" }}>Semana</span>
            <span className="text-2xl font-black" style={{ color: w === semanaAtual ? "hsl(220 80% 70%)" : "hsl(220 20% 45%)" }}>{w}</span>
            {w === semanaAtual && (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(220 80% 70%)" }}>Atual</span>
            )}
          </div>
        ))}
      </div>

      {/* ─── TABLE HEADER ─── */}
      <div className="grid grid-cols-[220px_1fr_110px_130px_130px_140px] gap-3 items-center px-6 pb-2 flex-shrink-0">
        {["KPI", "Progresso Mês", "% Mês", "Realizado", "Meta Mês", "Falta"].map((h, i) => (
          <span key={h} className={`text-xs font-bold uppercase tracking-wider ${i > 1 ? "text-right" : ""}`}
            style={{ color: "hsl(220 40% 50%)" }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* ─── KPI ROWS ─── */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 px-6 pb-3 pr-8">
        {items.map(item => {
          const realized = item.realizedValue ?? 0;
          const monthlyTarget = item.monthlyTarget!;
          const pct = monthlyTarget > 0 ? Math.round((realized / monthlyTarget) * 100) : 0;
          const remaining = Math.max(monthlyTarget - realized, 0);
          const achieved = remaining <= 0;
          const colors = getStatusColor(pct, ritmoIdeal);
          const clampedPct = Math.min(pct, 100);
          const ritmoClamp = Math.min(ritmoIdeal, 100);
          const perDay = Math.ceil(remaining / diasRestantes);

          return (
            <div
              key={item.label}
              className={`grid grid-cols-[220px_1fr_110px_130px_130px_140px] gap-3 items-center px-4 py-3.5 rounded-2xl transition-all ${colors.row}`}
              style={{
                background: achieved
                  ? "hsl(142 70% 45% / 0.08)"
                  : "hsl(220 40% 13% / 0.7)",
                border: `1px solid ${achieved ? "hsl(142 70% 45% / 0.3)" : "hsl(220 30% 20%)"}`,
              }}
            >
              {/* Name */}
              <div className="flex items-center gap-2">
                {achieved && <CheckCircle className="w-4 h-4 text-tv-green flex-shrink-0" />}
                <span className="text-base font-semibold truncate" style={{ color: "hsl(0 0% 93%)" }}>{item.label}</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-5 rounded-full overflow-visible" style={{ background: "hsl(220 30% 20%)" }}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 rounded"
                  style={{ left: `${ritmoClamp}%`, background: "hsl(0 0% 80% / 0.5)" }}
                />
              </div>

              {/* % */}
              <span className={`text-lg font-black tabular-nums text-right ${colors.text}`}>{pct}%</span>

              {/* Realized */}
              <span className="text-base font-semibold text-right tabular-nums" style={{ color: "hsl(0 0% 90%)" }}>
                {formatNumber(realized, item.isCurrency)}
              </span>

              {/* Target */}
              <span className="text-base text-right tabular-nums" style={{ color: "hsl(220 20% 50%)" }}>
                {formatNumber(monthlyTarget, item.isCurrency)}
              </span>

              {/* Remaining */}
              <div className="text-right">
                {achieved ? (
                  <span className="text-tv-green font-bold text-base">✓ Atingido</span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className={`text-base font-bold tabular-nums ${colors.text}`}>
                      -{formatNumber(remaining, item.isCurrency)}
                    </span>
                    <span className="text-xs" style={{ color: "hsl(220 40% 50%)" }}>
                      {formatNumber(perDay, item.isCurrency)}/dia
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="flex-shrink-0 px-6 pb-4 flex items-center gap-4 pt-2">
        <div className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "hsl(220 40% 13%)", border: "1px solid hsl(220 30% 20%)" }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: "hsl(220 60% 60%)" }} />
          <span className="text-sm" style={{ color: "hsl(220 40% 55%)" }}>
            Dias úteis restantes: <span className="font-bold" style={{ color: "hsl(0 0% 90%)" }}>{diasRestantes}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
      <span style={{ color: "hsl(220 40% 55%)" }}>{label}</span>
    </div>
  );
}

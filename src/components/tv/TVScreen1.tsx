import React from "react";
import { DashboardData, AssessorPerformance, GaugeKPI } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { Trophy, AlertTriangle, CheckCircle, Target, Zap, ArrowUp, ArrowDown, Flame } from "lucide-react";
import { WeeklyAction } from "@/components/dashboard/EclatWeeklyActions";

interface TVScreen1Props {
  data: DashboardData;
  mensagemDia: string;
  kpiPrioridade: string;
  weeklyActions?: WeeklyAction[];
}

// Funil ordered for TV display (most top of funnel first)
const FUNIL_ORDER = [
  "Primeira Reunião | Diagnóstico",
  "Habilitação",
  "Ativação",
  "Captação NET",
  "Receita XP",
  "Diversificação",
  "Receita Parceiros",
];

function getStatusColor(pct: number, ritmo: number): { bar: string; text: string; bg: string } {
  if (pct >= ritmo) return { bar: "bg-tv-green", text: "text-tv-green", bg: "bg-tv-green/10" };
  const diff = ritmo - pct;
  if (diff <= 10) return { bar: "bg-tv-yellow", text: "text-tv-yellow", bg: "bg-tv-yellow/10" };
  return { bar: "bg-tv-red", text: "text-tv-red", bg: "bg-tv-red/10" };
}

function getMonthStatus(icm: number, ritmo: number) {
  const diff = icm - ritmo;
  if (diff >= 0) return { label: diff > 5 ? "Acima do Ritmo" : "No Ritmo", color: "text-tv-green bg-tv-green/15 border-tv-green/30" };
  if (diff >= -5) return { label: "Atenção", color: "text-tv-yellow bg-tv-yellow/15 border-tv-yellow/30" };
  return { label: "Abaixo do Esperado", color: "text-tv-red bg-tv-red/15 border-tv-red/30" };
}

function TVHBar({ pct, ritmo }: { pct: number; ritmo: number }) {
  const { bar } = getStatusColor(pct, ritmo);
  const clampedPct = Math.min(pct, 100);
  const ritmoClamp = Math.min(ritmo, 100);
  return (
    <div className="relative h-4 bg-tv-border rounded-full overflow-visible">
      <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${clampedPct}%` }} />
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded"
        style={{ left: `${ritmoClamp}%` }}
      />
    </div>
  );
}

export function TVScreen1({ data, mensagemDia, kpiPrioridade }: TVScreen1Props) {
  const { icmGeral, ritmoIdeal, diasUteisRestantes, totalDiasUteis, gaugeKPIs, assessorPerformance, metaSemanal } = data;
  const status = getMonthStatus(icmGeral, ritmoIdeal);

  // Sort funnel KPIs
  const funilKPIs = FUNIL_ORDER
    .map(label => gaugeKPIs.find(k => k.label === label))
    .filter(Boolean) as GaugeKPI[];

  // Find gargalo: KPI with lowest pct/ritmo ratio (most behind proportionally)
  const gargalo = [...gaugeKPIs]
    .filter(k => k.target > 0)
    .sort((a, b) => {
      const ratioA = ritmoIdeal > 0 ? a.percentage / ritmoIdeal : a.percentage;
      const ratioB = ritmoIdeal > 0 ? b.percentage / ritmoIdeal : b.percentage;
      return ratioA - ratioB;
    })[0];

  // Meta do dia: proportional (monthly target / total business days)
  const metaDia = metaSemanal
    .filter(m => m.monthlyTarget && m.monthlyTarget > 0)
    .map(m => ({
      label: m.label,
      daily: m.monthlyTarget! / (totalDiasUteis || 1),
      isCurrency: m.isCurrency,
    }))
    .filter(m => m.daily > 0)
    .slice(0, 5);

  const autoMsg = gargalo
    ? `Foco de hoje: ${gargalo.label.toLowerCase()} — faltam ${formatNumber(Math.max(gargalo.target - gargalo.value, 0), gargalo.isCurrency)}`
    : "Foco total na execução do dia!";

  const displayMsg = mensagemDia || autoMsg;

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-hidden">
      {/* ─── STATUS STRIP ─── */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <StatusChip label="Realizado" value={`${icmGeral}%`} sub="ICM Geral" highlight="text-tv-gold" />
        <StatusChip label="Ritmo Ideal" value={`${ritmoIdeal}%`} sub="% dias úteis" highlight="text-tv-muted" />
        <StatusChip
          label="Dias Úteis Rest."
          value={String(diasUteisRestantes)}
          sub={`de ${totalDiasUteis} no mês`}
          highlight="text-tv-text"
        />
        <div className={`flex flex-col items-center justify-center rounded-xl border px-4 py-3 ${status.color}`}>
          <span className="text-sm font-medium opacity-70">Status</span>
          <span className="text-2xl font-bold leading-tight text-center">{status.label}</span>
        </div>
      </div>

      {/* ─── MAIN BODY ─── */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* ─── RANKING ─── */}
        <div className="w-[260px] flex-shrink-0 bg-tv-card border border-tv-border rounded-2xl p-4 flex flex-col gap-3 overflow-hidden">
          <h3 className="text-sm font-bold text-tv-muted uppercase tracking-widest flex-shrink-0">Ranking Assessores</h3>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
            {assessorPerformance.map((a, idx) => {
              const colors = getStatusColor(a.geralPercentage, ritmoIdeal);
              const isLeader = idx === 0;

              // Weekly delta: semana vs geral
              const weeklyDelta = Math.round((a.semanaPercentage ?? a.geralPercentage) - a.geralPercentage);
              const deltaPositive = weeklyDelta > 0;
              const deltaNeutral = weeklyDelta === 0;

              // Ranking trend: compare geral rank vs semana rank
              const weeklyRank = [...assessorPerformance]
                .sort((x, y) => (y.semanaPercentage ?? y.geralPercentage) - (x.semanaPercentage ?? x.geralPercentage))
                .findIndex(x => x.fullName === a.fullName);
              const trendUp = weeklyRank < idx;
              const trendDown = weeklyRank > idx;

              return (
                <div
                  key={a.fullName}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    isLeader ? "bg-tv-gold/10 border border-tv-gold/30" : colors.bg + " border border-transparent"
                  }`}
                >
                  <span className={`text-sm font-bold w-6 flex-shrink-0 ${isLeader ? "text-tv-gold" : "text-tv-muted"}`}>
                    {idx + 1}
                  </span>
                  {/* Trend arrow */}
                  {trendUp && <ArrowUp className="w-3.5 h-3.5 text-tv-green flex-shrink-0" />}
                  {trendDown && <ArrowDown className="w-3.5 h-3.5 text-tv-red flex-shrink-0" />}
                  {!trendUp && !trendDown && !isLeader && <span className="w-3.5 flex-shrink-0" />}
                  {isLeader && !trendUp && !trendDown && <Trophy className="w-4 h-4 text-tv-gold flex-shrink-0" />}
                  {isLeader && trendUp && <Trophy className="w-4 h-4 text-tv-gold flex-shrink-0" />}
                  {isLeader && trendDown && <Trophy className="w-4 h-4 text-tv-gold flex-shrink-0" />}

                  <span className={`text-base font-semibold flex-1 truncate ${isLeader ? "text-tv-gold" : "text-tv-text"}`}>
                    {a.name.split(" ")[0]}
                  </span>
                  <span className={`text-base font-bold flex-shrink-0 ${colors.text}`}>
                    {a.geralPercentage}%
                  </span>
                  {/* Weekly delta badge */}
                  {!deltaNeutral && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      deltaPositive
                        ? "bg-tv-green/15 text-tv-green"
                        : "bg-tv-red/15 text-tv-red"
                    }`}>
                      {deltaPositive ? "+" : ""}{weeklyDelta}pp
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── FUNIL ─── */}
        <div className="flex-1 bg-tv-card border border-tv-border rounded-2xl p-4 flex flex-col gap-2 overflow-hidden min-w-0">
          <h3 className="text-sm font-bold text-tv-muted uppercase tracking-widest flex-shrink-0 mb-1">Funil Comercial</h3>
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
            {funilKPIs.map(kpi => {
              const colors = getStatusColor(kpi.percentage, ritmoIdeal);
              const gap = Math.max(kpi.target - kpi.value, 0);
              return (
                <div key={kpi.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-medium text-tv-text truncate flex-1 mr-2">{kpi.label}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-tv-muted">{formatNumber(kpi.value, kpi.isCurrency)}</span>
                      <span className="text-sm text-tv-muted">/</span>
                      <span className="text-sm text-tv-muted">{formatNumber(kpi.target, kpi.isCurrency)}</span>
                      <span className={`text-base font-bold w-14 text-right ${colors.text}`}>
                        {kpi.percentage}%
                      </span>
                      {gap > 0 && (
                        <span className="text-sm text-tv-muted w-24 text-right">
                          -{formatNumber(gap, kpi.isCurrency)}
                        </span>
                      )}
                    </div>
                  </div>
                  <TVHBar pct={kpi.percentage} ritmo={ritmoIdeal} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── GARGALO ─── */}
        <div className="w-[260px] flex-shrink-0 bg-tv-card border border-tv-border rounded-2xl p-4 flex flex-col gap-3 overflow-hidden">
          <h3 className="text-sm font-bold text-tv-muted uppercase tracking-widest flex-shrink-0">Gargalo do Mês</h3>
          {gargalo ? (
            <GargaloCard kpi={gargalo} ritmoIdeal={ritmoIdeal} assessors={assessorPerformance} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-tv-green">
              <CheckCircle className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER STRIP ─── */}
      <div className="flex-shrink-0 bg-tv-card border border-tv-border rounded-2xl px-5 py-3 flex gap-6 items-center overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Target className="w-5 h-5 text-tv-gold flex-shrink-0" />
          <span className="text-sm font-bold text-tv-gold uppercase tracking-wider">Meta do Dia</span>
        </div>
        <div className="flex gap-5 flex-1 overflow-hidden">
          {metaDia.map(m => (
            <div key={m.label} className="flex flex-col items-center min-w-0">
              <span className="text-xs text-tv-muted truncate max-w-[100px]">{m.label}</span>
              <span className="text-base font-bold text-tv-text">{formatNumber(Math.ceil(m.daily), m.isCurrency)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 border-l border-tv-border pl-5">
          <Zap className="w-5 h-5 text-tv-gold flex-shrink-0" />
          <span className="text-base italic text-tv-text truncate">"{displayMsg}"</span>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ label, value, sub, highlight }: {
  label: string; value: string; sub: string; highlight: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-tv-card border border-tv-border rounded-xl px-4 py-3 gap-1">
      <span className="text-sm text-tv-muted font-medium">{label}</span>
      <span className={`text-3xl font-black tabular-nums ${highlight}`}>{value}</span>
      <span className="text-xs text-tv-muted">{sub}</span>
    </div>
  );
}

function GargaloCard({ kpi, ritmoIdeal, assessors }: {
  kpi: GaugeKPI; ritmoIdeal: number; assessors: AssessorPerformance[];
}) {
  const gap = Math.max(kpi.target - kpi.value, 0);
  const colors = getStatusColor(kpi.percentage, ritmoIdeal);
  const ritmoClamp = Math.min(ritmoIdeal, 100);
  const clampedPct = Math.min(kpi.percentage, 100);

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-tv-red flex-shrink-0" />
        <span className="text-lg font-bold text-tv-text">{kpi.label}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-tv-muted">Realizado</span>
          <span className="font-semibold text-tv-text">{formatNumber(kpi.value, kpi.isCurrency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tv-muted">Meta</span>
          <span className="font-semibold text-tv-text">{formatNumber(kpi.target, kpi.isCurrency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tv-muted">Falta</span>
          <span className={`font-bold ${colors.text}`}>{formatNumber(gap, kpi.isCurrency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tv-muted">Atingimento</span>
          <span className={`font-bold ${colors.text}`}>{kpi.percentage}%</span>
        </div>
      </div>
      <div className="relative h-3 bg-tv-border rounded-full mt-1">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${clampedPct}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded" style={{ left: `${ritmoClamp}%` }} />
      </div>
      <div className="mt-1">
        <span className="text-xs text-tv-muted font-semibold uppercase tracking-wider">Mais atrasados</span>
        <div className="space-y-1.5 mt-1">
          {assessors.slice(Math.max(assessors.length - 3, 0)).reverse().map(a => (
            <div key={a.fullName} className="flex justify-between text-sm">
              <span className="text-tv-text truncate">{a.name.split(" ")[0]}</span>
              <span className="text-tv-red font-semibold">{a.geralPercentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

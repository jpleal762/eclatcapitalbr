import { AssessorPerformance, GaugeKPI, ProcessedKPI } from "@/types/kpi";
import { formatNumber, filterByAssessor, filterByCategory, getMonthValue } from "@/lib/kpiUtils";
import { Trophy, TrendingUp, Zap, Star, AlertTriangle, Target } from "lucide-react";

interface TVScreen4Props {
  assessorPerformance: AssessorPerformance[];
  gaugeKPIs: GaugeKPI[];
  processedData: ProcessedKPI[];
  ritmoIdeal: number;
  selectedMonth: string;
}

function getAssessorKPIValue(data: ProcessedKPI[], assessor: string, category: string, month: string): number {
  const aData = filterByAssessor(data, assessor);
  const cData = filterByCategory(aData, category);
  const realized = cData.filter(d => d.status.toLowerCase().includes("realizado"));
  return getMonthValue(realized, month);
}

export function TVScreen4({ assessorPerformance, gaugeKPIs, processedData, ritmoIdeal, selectedMonth }: TVScreen4Props) {
  const sorted = [...assessorPerformance].sort((a, b) => b.geralPercentage - a.geralPercentage);
  const leader = sorted[0];
  const critical = sorted.filter(a => a.geralPercentage < ritmoIdeal * 0.35);

  // Top captação
  const captacaoData = sorted.map(a => ({
    assessor: a,
    value: getAssessorKPIValue(processedData, a.fullName || a.name, "Captação net", selectedMonth),
  })).sort((x, y) => y.value - x.value);
  const topCaptacao = captacaoData[0];

  // Top execução = most diagnósticos
  const diagData = sorted.map(a => ({
    assessor: a,
    value: getAssessorKPIValue(processedData, a.fullName || a.name, "Primeira reuniao", selectedMonth),
  })).sort((x, y) => y.value - x.value);
  const topExecucao = diagData[0];

  // Maior evolução semanal = highest semanaPercentage
  const topEvolution = [...assessorPerformance].sort((a, b) => b.semanaPercentage - a.semanaPercentage)[0];

  // Best conversion: ratio diagn -> habilitações
  const conversionData = sorted.map(a => {
    const diag = getAssessorKPIValue(processedData, a.fullName || a.name, "Primeira reuniao", selectedMonth);
    const habil = getAssessorKPIValue(processedData, a.fullName || a.name, "Habilitacao", selectedMonth);
    const rate = diag > 0 ? Math.round((habil / diag) * 100) : 0;
    return { assessor: a, rate, diag, habil };
  }).filter(x => x.diag > 0).sort((x, y) => y.rate - x.rate);
  const topConversao = conversionData[0];

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-hidden">
      <h2 className="text-2xl font-black text-tv-text tracking-tight flex-shrink-0 text-center">
        ⭐ Reconhecimento do Time
      </h2>

      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-5 min-h-0 overflow-hidden">
        {/* LEADER */}
        <RecognitionCard
          icon={<Trophy className="w-10 h-10" />}
          color="gold"
          title="Líder do Mês"
          name={leader?.name || "—"}
          metric={`ICM ${leader?.geralPercentage || 0}%`}
          sub={`${sorted.length > 1 ? `+${leader.geralPercentage - sorted[1].geralPercentage}pp sobre ${sorted[1].name.split(" ")[0]}` : "Líder absoluto"}`}
          animated
        />

        {/* TOP CAPTAÇÃO */}
        <RecognitionCard
          icon={<TrendingUp className="w-10 h-10" />}
          color="green"
          title="Top Captação"
          name={topCaptacao?.assessor?.name || "—"}
          metric={formatNumber(topCaptacao?.value || 0, true)}
          sub="Captação NET realizada"
        />

        {/* TOP EXECUÇÃO */}
        <RecognitionCard
          icon={<Zap className="w-10 h-10" />}
          color="blue"
          title="Top Execução"
          name={topExecucao?.assessor?.name || "—"}
          metric={`${topExecucao?.value || 0} diag.`}
          sub="Diagnósticos realizados"
        />

        {/* MAIOR EVOLUÇÃO */}
        <RecognitionCard
          icon={<Star className="w-10 h-10" />}
          color="yellow"
          title="Maior Evolução"
          name={topEvolution?.name || "—"}
          metric={`ICM Semanal ${topEvolution?.semanaPercentage || 0}%`}
          sub="Performance semanal"
        />

        {/* MELHOR CONVERSÃO */}
        <RecognitionCard
          icon={<Target className="w-10 h-10" />}
          color="purple"
          title="Melhor Conversão"
          name={topConversao?.assessor?.name || "—"}
          metric={`${topConversao?.rate || 0}%`}
          sub={`${topConversao?.habil || 0} habil. de ${topConversao?.diag || 0} diag.`}
        />

        {/* ZONA CRÍTICA */}
        <div className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
          critical.length === 0
            ? "bg-tv-green/10 border-tv-green/30"
            : "bg-tv-red/10 border-tv-red/30"
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-10 h-10 ${critical.length === 0 ? "text-tv-green" : "text-tv-red"}`} />
            <span className="text-base font-bold text-tv-muted uppercase tracking-widest">Zona Crítica</span>
          </div>
          {critical.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-tv-green font-bold text-xl">Todos no ritmo! 🎉</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {critical.map(a => (
                <div key={a.fullName} className="flex justify-between items-center bg-tv-red/10 rounded-xl px-4 py-2">
                  <span className="text-base font-semibold text-tv-text">{a.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-tv-red">{a.geralPercentage}%</span>
                    <span className="text-sm text-tv-muted">ICM</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {critical.length > 0 && (
            <p className="text-sm text-tv-muted text-center">
              Abaixo de {Math.round(ritmoIdeal * 0.35)}% (35% do ritmo)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecognitionCard({
  icon, color, title, name, metric, sub, animated
}: {
  icon: React.ReactNode;
  color: "gold" | "green" | "blue" | "yellow" | "purple";
  title: string;
  name: string;
  metric: string;
  sub: string;
  animated?: boolean;
}) {
  const colorMap = {
    gold: {
      border: animated ? "border-tv-gold/60 shadow-[0_0_24px_rgba(255,191,0,0.2)]" : "border-tv-gold/40",
      bg: "bg-tv-gold/8",
      icon: "text-tv-gold",
      name: "text-tv-gold",
      metric: "text-tv-gold",
    },
    green: { border: "border-tv-green/40", bg: "bg-tv-green/8", icon: "text-tv-green", name: "text-tv-text", metric: "text-tv-green" },
    blue: { border: "border-blue-500/40", bg: "bg-blue-500/8", icon: "text-blue-400", name: "text-tv-text", metric: "text-blue-400" },
    yellow: { border: "border-tv-yellow/40", bg: "bg-tv-yellow/8", icon: "text-tv-yellow", name: "text-tv-text", metric: "text-tv-yellow" },
    purple: { border: "border-purple-500/40", bg: "bg-purple-500/8", icon: "text-purple-400", name: "text-tv-text", metric: "text-purple-400" },
  };
  const c = colorMap[color];

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-2xl border ${c.border} ${c.bg} ${animated ? "animate-pulse-slow" : ""} transition-all`}>
      <div className="flex items-center gap-3">
        <span className={c.icon}>{icon}</span>
        <span className="text-sm font-bold text-tv-muted uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <span className={`text-3xl font-black leading-tight truncate ${c.name}`}>{name}</span>
        <span className={`text-xl font-bold tabular-nums ${c.metric}`}>{metric}</span>
        <span className="text-sm text-tv-muted">{sub}</span>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { useResponsiveSize } from "@/hooks/use-responsive-size";

interface AgendadasCardProps {
  agendadasValue: number;
  agendadasTarget: number;
  agendadasPercentage: number;
  assessorData: Array<{ name: string; value: number }>;
}

export function AgendadasCard({
  agendadasValue,
  agendadasTarget,
  agendadasPercentage,
  assessorData
}: AgendadasCardProps) {
  const { scale } = useResponsiveSize();

  // Dynamic gauge sizing - compact for half height
  const dynamicScale = Math.max(0.7, Math.min(scale * 1.1, 1.6));
  const gaugeWidth = Math.round(140 * dynamicScale);
  const gaugeHeight = Math.round(80 * dynamicScale);
  const gaugeRadius = Math.round(60 * dynamicScale);
  const strokeWidth = Math.round(12 * dynamicScale);
  const circumference = Math.PI * gaugeRadius;
  const progress = Math.min(agendadasPercentage, 100) / 100 * circumference;

  return (
    <Card className="p-2 shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
      {/* Header compacto */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
        <h3 className="text-responsive-sm font-semibold text-white">
          Primeiras Reuniões Agendadas Semana
        </h3>
      </div>

      <div className="flex items-center justify-center gap-6 flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative" style={{ width: gaugeWidth, height: gaugeHeight }}>
            <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight + 10}`}>
              <path
                d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`}
                fill="none"
                stroke="white"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-responsive-2xl font-bold text-white">{agendadasValue}</span>
            </div>
          </div>
          <p className="text-responsive-xs text-white/70 mt-1">
            Meta: {agendadasTarget} ({agendadasPercentage}%)
          </p>
        </div>

        {/* Lista de Assessores */}
        <div className="w-[120px] max-h-full overflow-hidden flex flex-col flex-shrink-0">
          <p className="text-responsive-xs text-white/70 mb-1 flex-shrink-0">Por Assessor</p>
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="space-y-0.5">
              {assessorData.map((assessor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-responsive-xs py-0.5 px-0.5 rounded hover:bg-white/10"
                >
                  <span className="truncate text-white max-w-[80%]">
                    {assessor.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="font-semibold text-white ml-2">{assessor.value}</span>
                </div>
              ))}
              {assessorData.length === 0 && (
                <p className="text-responsive-xs text-white/70 italic">Sem dados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

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

  // Dynamic gauge sizing - larger for full column
  const dynamicScale = Math.max(0.8, Math.min(scale * 1.2, 2.5));
  const gaugeWidth = Math.round(180 * dynamicScale);
  const gaugeHeight = Math.round(100 * dynamicScale);
  const gaugeRadius = Math.round(75 * dynamicScale);
  const strokeWidth = Math.round(14 * dynamicScale);
  const circumference = Math.PI * gaugeRadius;
  const progress = Math.min(agendadasPercentage, 100) / 100 * circumference;

  return (
    <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-responsive flex-shrink-0">
        <h3 className="text-responsive-sm font-semibold text-white">
          Primeiras Reuniões Agendadas Semana
        </h3>
      </div>

      {/* Gauge - centered */}
      <div className="flex justify-center items-center py-responsive flex-shrink-0">
        <div className="flex flex-col items-center">
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
      </div>

      {/* Lista de Assessores - flex-1 para ocupar espaço restante */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <p className="text-responsive-xs text-white/70 mb-responsive-sm flex-shrink-0">Por Assessor</p>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-responsive-sm">
            {assessorData.map((assessor, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-responsive-xs py-responsive-sm px-responsive-sm rounded hover:bg-white/10 transition-colors"
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
    </Card>
  );
}

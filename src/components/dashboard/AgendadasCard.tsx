import { Card } from "@/components/ui/card";

interface AgendadasCardProps {
  agendadasValue: number;
  assessorData: Array<{ name: string; value: number }>;
}

export function AgendadasCard({
  agendadasValue,
  assessorData
}: AgendadasCardProps) {
  return (
    <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1 flex-shrink-0">
        <h3 className="text-responsive-xs font-semibold text-white whitespace-nowrap truncate">
          Reuniões Agendadas Semana
        </h3>
      </div>

      {/* Content - Horizontal layout: Number left, Assessors right */}
      <div className="flex flex-row flex-1 gap-2 min-h-0 overflow-hidden">
        {/* Left: Large number - vertically centered */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[60px]">
          <span className="text-responsive-2xl font-bold text-white whitespace-nowrap">
            {agendadasValue}
          </span>
          <span className="text-responsive-4xs text-white/70">
            reuniões
          </span>
        </div>

        {/* Right: Assessor list */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <p className="text-responsive-4xs text-white/70 mb-0.5 flex-shrink-0 whitespace-nowrap">Por Assessor</p>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-0">
              {assessorData.map((assessor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-responsive-4xs py-0 px-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <span className="truncate text-white max-w-[70%]">
                    {assessor.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="font-semibold text-white ml-1">{assessor.value}</span>
                </div>
              ))}
              {assessorData.length === 0 && (
                <p className="text-responsive-4xs text-white/70 italic">Sem dados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
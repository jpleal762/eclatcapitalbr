import { Card } from "@/components/ui/card";

export interface AssessorAgendadasData {
  name: string;
  value: number;
}

interface AssessorAgendadasMatrixProps {
  assessorData: AssessorAgendadasData[];
  title?: string;
  isTvMode?: boolean;
}

export function AssessorAgendadasMatrix({
  assessorData,
  title = "Agendadas por Assessor",
  isTvMode = false
}: AssessorAgendadasMatrixProps) {
  if (!assessorData || assessorData.length === 0) {
    return null;
  }

  return (
    <Card className={`${isTvMode ? 'p-4 min-w-[220px] max-w-[280px]' : 'p-2 min-w-[120px] max-w-[140px]'} bg-card shadow-card h-full flex flex-col`}>
      <h5 className={`${isTvMode ? 'text-tv-sm' : 'text-[10px]'} font-semibold text-muted-foreground mb-1.5 truncate`}>
        {title}
      </h5>
      <div className={`${isTvMode ? 'space-y-1' : 'space-y-0.5'} overflow-y-auto flex-1`}>
        {assessorData.map((item, index) => (
          <div key={index} className={`flex justify-between items-center ${isTvMode ? 'text-tv-xs' : 'text-[9px]'} gap-1`}>
            <span className={`font-medium truncate ${isTvMode ? 'max-w-[100px]' : 'max-w-[50px]'}`} title={item.name}>
              {item.name}
            </span>
            <span className="font-medium flex-shrink-0 text-gray-500">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

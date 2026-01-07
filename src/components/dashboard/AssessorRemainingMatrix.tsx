import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { CheckCircle2, Trophy, PartyPopper } from "lucide-react";

export interface AssessorRemainingData {
  name: string;
  remaining: number;
  achieved: boolean;
}

interface AssessorRemainingMatrixProps {
  assessorData: AssessorRemainingData[];
  isCurrency: boolean;
  title?: string;
  isTvMode?: boolean;
}

export function AssessorRemainingMatrix({
  assessorData,
  isCurrency,
  title = "Falta por Assessor",
  isTvMode = false
}: AssessorRemainingMatrixProps) {
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
            {item.achieved ? (
              <span className="flex items-center gap-0.5 flex-shrink-0">
                {isTvMode && <PartyPopper className="h-4 w-4 text-yellow-500 animate-celebrate-pop" />}
                {isTvMode && <Trophy className="h-4 w-4 text-yellow-500 animate-celebrate-bounce" />}
                <CheckCircle2 className={`${isTvMode ? 'h-5 w-5 animate-celebrate-sparkle' : 'h-3 w-3'} text-green-500`} />
              </span>
            ) : (
              <span className="font-medium flex-shrink-0 text-secondary-foreground">
                {formatNumber(item.remaining, isCurrency)}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

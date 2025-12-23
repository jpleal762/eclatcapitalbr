import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import { CheckCircle2 } from "lucide-react";
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
  return <Card className={`${isTvMode ? 'p-3 min-w-[140px] max-w-[160px]' : 'p-2 min-w-[120px] max-w-[140px]'} bg-card shadow-card h-full flex flex-col`}>
      <h5 className={`${isTvMode ? 'text-xs' : 'text-[10px]'} font-semibold text-muted-foreground mb-1.5 truncate`}>
        {title}
      </h5>
      <div className="space-y-0.5 overflow-y-auto flex-1">
        {assessorData.map((item, index) => <div key={index} className={`flex justify-between items-center ${isTvMode ? 'text-xs' : 'text-[9px]'} gap-1`}>
            <span className={`font-medium truncate ${isTvMode ? 'max-w-[60px]' : 'max-w-[50px]'}`} title={item.name}>
              {item.name}
            </span>
            {item.achieved ? <span className="flex items-center gap-0.5 text-green-500 flex-shrink-0">
                <CheckCircle2 className={`${isTvMode ? 'h-4 w-4' : 'h-3 w-3'}`} />
              </span> : <span className="font-medium flex-shrink-0 text-secondary-foreground">
                {formatNumber(item.remaining, isCurrency)}
              </span>}
          </div>)}
      </div>
    </Card>;
}
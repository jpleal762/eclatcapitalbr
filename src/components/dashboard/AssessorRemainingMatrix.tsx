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
}
export function AssessorRemainingMatrix({
  assessorData,
  isCurrency,
  title = "Falta por Assessor"
}: AssessorRemainingMatrixProps) {
  if (!assessorData || assessorData.length === 0) {
    return null;
  }
  return <Card className="p-2 bg-card shadow-card min-w-[120px] max-w-[140px] h-full flex flex-col">
      <h5 className="text-[10px] font-semibold text-muted-foreground mb-1.5 truncate">
        {title}
      </h5>
      <div className="space-y-0.5 overflow-y-auto flex-1">
        {assessorData.map((item, index) => <div key={index} className="flex justify-between items-center text-[9px] gap-1">
            <span className="font-medium truncate max-w-[50px]" title={item.name}>
              {item.name}
            </span>
            {item.achieved ? <span className="flex items-center gap-0.5 text-green-500 flex-shrink-0">
                <CheckCircle2 className="h-3 w-3" />
              </span> : <span className="font-medium flex-shrink-0 text-secondary-foreground">
                {formatNumber(item.remaining, isCurrency)}
              </span>}
          </div>)}
      </div>
    </Card>;
}
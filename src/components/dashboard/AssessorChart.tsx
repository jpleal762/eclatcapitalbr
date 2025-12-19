import { Card } from "@/components/ui/card";
import { AssessorPerformance } from "@/types/kpi";

interface AssessorChartProps {
  data: AssessorPerformance[];
}

export function AssessorChart({ data }: AssessorChartProps) {
  // Filter out "Socios" from ranking
  const filteredData = data.filter(assessor => assessor.name !== "Socios");

  const getMedalEmoji = (index: number): string => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const getBarColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-primary";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <Card className="p-4 shadow-card">
      <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
        <span>🏆</span> ICM% por Assessor
      </h3>
      
      <div className="space-y-1.5">
        {filteredData.map((assessor, index) => (
          <div 
            key={assessor.name} 
            className={`flex items-center gap-2 p-1.5 rounded-md transition-all hover:translate-x-1 ${
              index < 3 ? 'bg-muted/50' : 'bg-background'
            }`}
          >
            <div className="w-6 text-center font-bold text-sm">
              {getMedalEmoji(index) || `#${index + 1}`}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{assessor.name}</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(assessor.geralPercentage)}`}
                  style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-sm font-bold ${
                assessor.geralPercentage >= 90 ? 'text-green-600' :
                assessor.geralPercentage >= 70 ? 'text-primary' :
                assessor.geralPercentage >= 50 ? 'text-yellow-600' : 'text-destructive'
              }`}>
                {assessor.geralPercentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground italic">
          Ranking de todos os assessores para o mês selecionado
        </p>
      </div>
    </Card>
  );
}

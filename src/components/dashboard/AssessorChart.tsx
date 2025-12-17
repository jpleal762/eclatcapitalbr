import { Card } from "@/components/ui/card";
import { AssessorPerformance } from "@/types/kpi";

interface AssessorChartProps {
  data: AssessorPerformance[];
}

export function AssessorChart({ data }: AssessorChartProps) {
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
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <span>🏆</span> Ranking ICM% por Assessor
      </h3>
      
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
        {data.slice(0, 10).map((assessor, index) => (
          <div 
            key={assessor.name} 
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-1 ${
              index < 3 ? 'bg-muted/50' : 'bg-background'
            }`}
          >
            <div className="w-8 text-center font-bold text-lg">
              {getMedalEmoji(index) || `#${index + 1}`}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{assessor.name}</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(assessor.geralPercentage)}`}
                  style={{ width: `${Math.min(assessor.geralPercentage, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-lg font-bold ${
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

      <div className="mt-4 pt-3 border-t border-border text-center">
        <p className="text-xs text-muted-foreground italic">
          Ranking de todos os assessores para o mês selecionado
        </p>
      </div>
    </Card>
  );
}

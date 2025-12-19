import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";

interface MetaTableProps {
  data: MetaSemanal[];
  realPercentage: number;
  selectedAssessor?: string;
  weekToMonthPercentage?: number;
}

export function MetaTable({ data, realPercentage, selectedAssessor, weekToMonthPercentage }: MetaTableProps) {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Metas Semanais</h3>
        {selectedAssessor && selectedAssessor !== "all" && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {selectedAssessor.split(" ").slice(0, 2).join(" ")}
          </span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">KPI</th>
              <th className="text-right py-2 text-sm font-medium text-muted-foreground">Meta Semanal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 text-sm text-foreground">{item.label}</td>
                <td className="py-2.5 text-sm text-right font-medium text-primary">
                  {typeof item.value === 'number' 
                    ? (item.isCurrency
                        ? formatNumber(item.value, true)
                        : formatNumber(item.value))
                    : item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">
          {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
        </span>
        <p className="text-xs text-muted-foreground italic">
          {selectedAssessor && selectedAssessor !== "all" 
            ? `Metas individuais de ${selectedAssessor.split(" ")[0]}`
            : "Valores consolidados do escritório"}
        </p>
      </div>
    </Card>
  );
}

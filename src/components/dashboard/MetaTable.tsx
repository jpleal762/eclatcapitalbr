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
    <Card className="p-4 shadow-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Metas Semanais</h3>
        {selectedAssessor && selectedAssessor !== "all" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {selectedAssessor.split(" ").slice(0, 2).join(" ")}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 text-xs font-medium text-muted-foreground">KPI</th>
              <th className="text-right py-1.5 text-xs font-medium text-muted-foreground">Meta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-1.5 text-xs text-foreground">{item.label}</td>
                <td className="py-1.5 text-xs text-right font-medium text-primary">
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

      <div className="mt-auto pt-2 border-t border-border flex items-center justify-between flex-shrink-0">
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

import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
interface MetaTableProps {
  data: MetaSemanal[];
  realPercentage: number;
  selectedAssessor?: string;
  weekToMonthPercentage?: number;
}
export function MetaTable({
  data,
  realPercentage,
  selectedAssessor,
  weekToMonthPercentage
}: MetaTableProps) {
  return <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-responsive flex-shrink-0">
        <h3 className="text-responsive-sm font-semibold text-foreground">Meta Semanal Acumulada</h3>
        {selectedAssessor && selectedAssessor !== "all" && <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-primary text-primary-foreground font-medium">
            {selectedAssessor.split(" ").slice(0, 2).join(" ")}
          </span>}
      </div>
      
      <div className="flex-1 overflow-hidden min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-responsive-sm text-responsive-xs font-medium text-muted-foreground">KPI</th>
              <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Meta</th>
              <th className="text-right py-responsive-sm text-responsive-xs font-medium text-muted-foreground">Realizado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => <tr key={index} className="border-b border-border hover:bg-muted transition-colors">
                <td className="py-responsive-sm text-responsive-xs text-foreground">{item.label}</td>
                <td className="py-responsive-sm text-responsive-xs text-right font-medium text-secondary-foreground">
                  {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                </td>
                <td className="py-responsive-sm text-responsive-xs text-right font-medium text-secondary-foreground">
                  {item.realizedValue !== undefined ? formatNumber(item.realizedValue, item.isCurrency) : "-"}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      <div className="mt-auto pt-responsive border-t border-border flex items-center justify-between flex-shrink-0">
        <span className="text-responsive-base font-semibold text-primary">
          {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
        </span>
        <p className="text-responsive-xs text-muted-foreground italic">
          {selectedAssessor && selectedAssessor !== "all" ? `Metas individuais de ${selectedAssessor.split(" ")[0]}` : "Valores consolidados do escritório"}
        </p>
      </div>
    </Card>;
}
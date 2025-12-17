import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";

interface MetaTableProps {
  data: MetaSemanal[];
  realPercentage: number;
  headName?: string;
}

export function MetaTable({ data, realPercentage, headName = "Head Bruno" }: MetaTableProps) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Meta Semanal</h3>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Real</span>
          <span className="text-2xl font-bold text-primary">{realPercentage}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-1 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">
              {typeof item.value === "number" ? formatNumber(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">*% Planejado do mês</span>
        <span className="text-xs font-medium">{Math.round(realPercentage * 0.88)}%</span>
      </div>

      <div className="mt-2 text-right">
        <span className="text-xs text-muted-foreground italic">{headName}</span>
      </div>
    </Card>
  );
}

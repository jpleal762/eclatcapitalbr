import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { Check, ClipboardList } from "lucide-react";

interface FlipMetaTableProps {
  data: MetaSemanal[];
  realPercentage: number;
  selectedAssessor?: string;
  weekToMonthPercentage?: number;
  isFlipped?: boolean;
}

export function FlipMetaTable({
  data,
  realPercentage,
  selectedAssessor,
  weekToMonthPercentage,
}: FlipMetaTableProps) {

  const getRemainingValue = (item: MetaSemanal): number => {
    if (item.realizedValue === undefined) return 0;
    const targetValue = typeof item.value === 'number' ? item.value : 0;
    const remaining = targetValue - item.realizedValue;
    return remaining > 0 ? remaining : 0;
  };

  const isGoalMet = (item: MetaSemanal): boolean => {
    if (item.realizedValue === undefined) return false;
    const targetValue = typeof item.value === 'number' ? item.value : 0;
    return item.realizedValue >= targetValue;
  };

  return (
    <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
      <div className="flex items-center justify-between mb-responsive flex-shrink-0">
        <div className="flex flex-col">
          <h3 className="text-responsive-2xl font-semibold text-white flex items-center gap-1">Planejamento <ClipboardList className="icon-responsive-lg" /></h3>
          <span className="text-responsive-xs text-white/50 italic">*definido na reunião semanal em equipe</span>
        </div>
        {selectedAssessor && selectedAssessor !== "all" && (
          <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-white/20 text-white font-medium">
            {selectedAssessor.split(" ").slice(0, 2).join(" ")}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-responsive-sm text-responsive-sm font-medium text-white/70">KPI</th>
              <th className="text-right py-responsive-sm text-responsive-sm font-medium text-white/70">Meta Mês</th>
              <th className="text-right py-responsive-sm text-responsive-sm font-medium text-white/70">Meta Sem.</th>
              <th className="text-right py-responsive-sm text-responsive-sm font-medium text-white/70">Realizado</th>
              <th className="text-right py-responsive-sm text-responsive-sm font-medium text-white/70">Falta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const goalMet = isGoalMet(item);
              const remaining = getRemainingValue(item);
              
              return (
                <tr key={index} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-responsive-sm text-responsive-sm text-white">{item.label}</td>
                  <td className="py-responsive-sm text-responsive-sm text-right font-medium text-white/40">
                    {item.monthlyTarget !== undefined && item.monthlyTarget > 0
                      ? item.isCurrency ? formatNumber(item.monthlyTarget, true) : formatNumber(item.monthlyTarget)
                      : "-"}
                  </td>
                  <td className="py-responsive-sm text-responsive-sm text-right font-medium text-blue-300/90">
                    {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                  </td>
                  <td className={`py-responsive-sm text-responsive-sm text-right font-medium ${goalMet ? 'text-green-400' : 'text-white/90'}`}>
                    {item.realizedValue !== undefined ? (
                      goalMet ? (
                        <span className="inline-flex items-center justify-end gap-1">
                          <Check className="w-3 h-3 text-green-400" />
                          <span>{formatNumber(item.realizedValue, item.isCurrency)}</span>
                        </span>
                      ) : (
                        formatNumber(item.realizedValue, item.isCurrency)
                      )
                    ) : "-"}
                  </td>
                  <td className="py-responsive-sm text-responsive-sm text-right font-medium">
                    {item.realizedValue === undefined ? (
                      <span className="text-white/40">-</span>
                    ) : goalMet ? (
                      <span className="text-green-400 text-responsive-xs font-semibold">Atingido</span>
                    ) : (
                      <span className="text-red-400">{formatNumber(remaining, item.isCurrency)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-auto pt-responsive border-t border-white/20 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-responsive-lg font-semibold text-white">
            {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
          </span>
          <span className="text-responsive-xs text-white/60">Percentual planejado p/ semana</span>
        </div>
        <p className="text-responsive-sm text-white/70 italic">
          {selectedAssessor && selectedAssessor !== "all" ? `Metas individuais de ${selectedAssessor.split(" ")[0]}` : "Valores consolidados do escritório"}
        </p>
      </div>
    </Card>
  );
}

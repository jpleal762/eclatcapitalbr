import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MetaSemanal } from "@/types/kpi";
import { formatNumber } from "@/lib/kpiUtils";
import { RotateCcw, Check, ClipboardList } from "lucide-react";

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
  isFlipped: controlledFlipped,
}: FlipMetaTableProps) {
  const [manualFlipOffset, setManualFlipOffset] = useState(0);
  
  const isFlipped = controlledFlipped !== undefined 
    ? (controlledFlipped !== (manualFlipOffset % 2 === 1))
    : (manualFlipOffset % 2 === 1);

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

  const handleFlip = () => {
    setManualFlipOffset(prev => prev + 1);
  };

  return (
    <div 
      className="relative h-full cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front - Planejamento */}
        <div className="absolute inset-0 backface-hidden overflow-hidden">
          <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
            <div className="flex items-center justify-between mb-responsive flex-shrink-0">
              <div className="flex flex-col">
                <h3 className="text-responsive-lg font-semibold text-white flex items-center gap-1">Planejamento <ClipboardList className="icon-responsive" /></h3>
                <span className="text-responsive-4xs text-white/50 italic">*definido na reunião semanal em equipe</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedAssessor && selectedAssessor !== "all" && (
                  <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-white/20 text-white font-medium">
                    {selectedAssessor.split(" ").slice(0, 2).join(" ")}
                  </span>
                )}
                <div className="p-1 rounded-full bg-white/20 opacity-50 hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-responsive-sm text-responsive-xs font-medium text-white/70">KPI</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Meta Mês</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Meta Sem.</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Realizado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="py-responsive-sm text-responsive-xs text-white">{item.label}</td>
                      <td className="py-responsive-sm text-responsive-xs text-right font-medium text-white/40">
                        {item.monthlyTarget !== undefined && item.monthlyTarget > 0
                          ? item.isCurrency ? formatNumber(item.monthlyTarget, true) : formatNumber(item.monthlyTarget)
                          : "-"}
                      </td>
                      <td className="py-responsive-sm text-responsive-xs text-right font-medium text-blue-300/90">
                        {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                      </td>
                      <td className="py-responsive-sm text-responsive-xs text-right font-medium text-white/90">
                        {item.realizedValue !== undefined ? formatNumber(item.realizedValue, item.isCurrency) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-responsive border-t border-white/20 flex items-center justify-between flex-shrink-0">
              <span className="text-responsive-base font-semibold text-white">
                {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
              </span>
              <p className="text-responsive-xs text-white/70 italic">
                {selectedAssessor && selectedAssessor !== "all" ? `Metas individuais de ${selectedAssessor.split(" ")[0]}` : "Valores consolidados do escritório"}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Back - Remaining to Goal */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden">
          <Card className="p-responsive shadow-card h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#094780' }}>
            <div className="flex items-center justify-between mb-responsive flex-shrink-0">
              <h3 className="text-responsive-lg font-semibold text-white flex items-center gap-1"><ClipboardList className="icon-responsive-sm" /> Falta para Meta Semanal</h3>
              <div className="flex items-center gap-2">
                {selectedAssessor && selectedAssessor !== "all" && (
                  <span className="text-responsive-xs px-2 py-responsive-sm rounded-full bg-white/20 text-white font-medium">
                    {selectedAssessor.split(" ").slice(0, 2).join(" ")}
                  </span>
                )}
                <div className="p-1 rounded-full bg-white/20 opacity-50 hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-responsive-sm text-responsive-xs font-medium text-white/70">KPI</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Meta Mês</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Meta Sem.</th>
                    <th className="text-right py-responsive-sm text-responsive-xs font-medium text-white/70">Falta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const goalMet = isGoalMet(item);
                    const remaining = getRemainingValue(item);
                    
                    return (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                        <td className="py-responsive-sm text-responsive-xs text-white">{item.label}</td>
                        <td className="py-responsive-sm text-responsive-xs text-right font-medium text-white/40">
                          {item.monthlyTarget !== undefined && item.monthlyTarget > 0
                            ? item.isCurrency ? formatNumber(item.monthlyTarget, true) : formatNumber(item.monthlyTarget)
                            : "-"}
                        </td>
                        <td className="py-responsive-sm text-responsive-xs text-right font-medium text-blue-300/90">
                          {typeof item.value === 'number' ? item.isCurrency ? formatNumber(item.value, true) : formatNumber(item.value) : item.value}
                        </td>
                        <td className={`py-responsive-sm text-responsive-xs text-right font-medium ${
                          goalMet ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.realizedValue === undefined ? (
                            "-"
                          ) : goalMet ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>{formatNumber(item.realizedValue, item.isCurrency)}</span>
                            </span>
                          ) : (
                            formatNumber(remaining, item.isCurrency)
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-responsive border-t border-white/20 flex items-center justify-between flex-shrink-0">
              <span className="text-responsive-base font-semibold text-white">
                {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
              </span>
              <p className="text-responsive-xs text-white/70 italic">
                Diferença entre meta e realizado
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

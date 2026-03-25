import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HBarKPICard, HBarKPICardProps } from "./HBarKPICard";
import { formatNumber } from "@/lib/kpiUtils";
import { RotateCcw } from "lucide-react";

interface FlipHBarKPICardProps extends Omit<HBarKPICardProps, "showAssessorList" | "assessorRemainingData" | "assessorListLabel"> {
  backTitle: string;
  backData: Array<{ name: string; value: number }>;
  isFlipped?: boolean;
}

export function FlipHBarKPICard({
  backTitle,
  backData,
  isFlipped: controlledFlipped,
  isCurrency = false,
  ...cardProps
}: FlipHBarKPICardProps) {
  const [manualFlipOffset, setManualFlipOffset] = useState(0);

  const isFlipped =
    controlledFlipped !== undefined
      ? controlledFlipped !== manualFlipOffset % 2 === 1
      : manualFlipOffset % 2 === 1;

  return (
    <div
      className="relative h-full cursor-pointer perspective-1000"
      onClick={() => setManualFlipOffset((p) => p + 1)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front — HBarKPICard */}
        <div className="absolute inset-0 backface-hidden overflow-hidden">
          <HBarKPICard {...cardProps} isCurrency={isCurrency} />
          <div className="absolute top-1 right-1 p-[3px] rounded-full bg-muted opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
            <RotateCcw className="w-2.5 h-2.5 text-muted-foreground" />
          </div>
        </div>

        {/* Back — assessor list */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden">
          <Card className="h-full p-responsive-sm flex flex-col shadow-card">
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h4 className="text-responsive-xs font-semibold text-foreground truncate">
                {backTitle}
              </h4>
              <RotateCcw className="icon-responsive-sm text-muted-foreground flex-shrink-0 ml-1" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-[2px]">
                {backData.length > 0 ? (
                  backData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-responsive-xs gap-2"
                    >
                      <span className="font-medium text-foreground truncate max-w-[55%]">
                        {item.name}
                      </span>
                      <span className="font-semibold text-secondary-foreground flex-shrink-0">
                        {formatNumber(item.value, isCurrency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-responsive-4xs text-muted-foreground italic text-center py-1">
                    Sem dados
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

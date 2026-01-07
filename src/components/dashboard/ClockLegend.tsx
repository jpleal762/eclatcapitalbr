import { Clock } from "lucide-react";

interface ClockLegendProps {
  isTvMode?: boolean;
}

export function ClockLegend({ isTvMode = false }: ClockLegendProps) {
  return (
    <div className={`flex items-center gap-4 ${isTvMode ? 'text-tv-xs' : 'text-responsive-3xs'}`}>
      <span className="text-muted-foreground font-medium">Ritmo:</span>
      
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 shadow-sm border border-white/50">
          <Clock className="w-2 h-2 text-white" />
        </div>
        <span className="text-muted-foreground">No ritmo</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 shadow-sm animate-pulse-clock border border-white/50">
          <Clock className="w-2 h-2 text-white" />
        </div>
        <span className="text-muted-foreground">Atenção</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 shadow-sm animate-pulse-clock border border-white/50">
          <Clock className="w-2 h-2 text-white" />
        </div>
        <span className="text-muted-foreground">Crítico</span>
      </div>
    </div>
  );
}

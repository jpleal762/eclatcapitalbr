import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, Clock, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface YearlyICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessors: string[];
  selectedAssessor: string;
  selectedYear: number;
  availableYears: number[];
  onAssessorChange: (value: string) => void;
  onYearChange: (value: number) => void;
  onToggleView: () => void;
}

export function YearlyICMCard({
  icmGeral,
  ritmoIdeal,
  diasUteisRestantes,
  assessors,
  selectedAssessor,
  selectedYear,
  availableYears,
  onAssessorChange,
  onYearChange,
  onToggleView,
}: YearlyICMCardProps) {
  // Fixed gauge dimensions - 50% reduction
  const gaugeWidth = 90;
  const gaugeHeight = 50;
  const gaugeRadius = 40;
  const strokeWidth = 7;
  
  const circumference = Math.PI * gaugeRadius;
  const progress = (Math.min(icmGeral, 100) / 100) * circumference;

  return (
    <Card className="p-responsive-lg shadow-card border-l-4 border-l-chart-graphite">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-responsive">
        <h3 className="text-responsive-xs font-medium text-muted-foreground">
          ICM Anual
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleView}
          className="gap-responsive-sm text-responsive-xs h-auto py-1 px-2"
        >
          <CalendarDays className="icon-responsive-sm" />
          Visão Mensal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-responsive mb-responsive">
        <Select value={selectedAssessor} onValueChange={onAssessorChange}>
          <SelectTrigger className="w-[160px] bg-background text-responsive-xs h-auto py-1">
            <SelectValue placeholder="TODOS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">TODOS (Escritório)</SelectItem>
            {assessors.map((a) => (
              <SelectItem key={a} value={a}>
                {a.split(" ").slice(0, 2).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={String(selectedYear)} 
          onValueChange={(v) => onYearChange(parseInt(v))}
        >
          <SelectTrigger className="w-[100px] bg-background text-responsive-xs h-auto py-1">
            <SelectValue placeholder={String(selectedYear)} />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center gap-responsive-lg">
        {/* Gauge with graphite color */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-responsive-lg font-semibold mb-responsive text-foreground">ICM Anual</h3>
          
          <div className="relative" style={{ width: gaugeWidth, height: gaugeHeight }}>
            <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight + 10}`}>
              <path
                d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d={`M ${strokeWidth / 2} ${gaugeHeight} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeWidth - strokeWidth / 2} ${gaugeHeight}`}
                fill="none"
                stroke="hsl(var(--chart-graphite))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-responsive-3xl font-bold text-foreground">{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining */}
        <div className="text-center px-responsive py-responsive-sm">
          <p className="text-responsive-xs text-muted-foreground mb-responsive-sm">Dias Úteis<br/>Restantes no Ano</p>
          <p className="text-responsive-2xl font-bold text-foreground">{diasUteisRestantes}</p>
        </div>
      </div>

      {/* Progress bars with graphite theme */}
      <div className="mt-responsive-lg space-y-responsive">
        <div className="space-y-responsive-sm">
          <div className="flex justify-between text-responsive-sm">
            <span className="font-medium text-foreground">ICM Anual</span>
            <span className="font-bold text-foreground">{icmGeral}%</span>
          </div>
          <div className="relative">
            <div className="h-bar-responsive w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-chart-graphite transition-all duration-500"
                style={{ width: `${Math.min(icmGeral, 100)}%` }}
              />
            </div>
            {/* Marcador de Ritmo Ideal com tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute top-0 flex flex-col items-center cursor-pointer transition-all duration-500 ease-out"
                    style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
                    <div className="w-0.5 h-bar-responsive bg-primary -mt-0.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="text-responsive-xs text-muted-foreground">Ritmo Ideal: {ritmoIdeal}%</p>
                    <p className={`text-responsive-sm font-bold ${icmGeral >= ritmoIdeal ? 'text-green-600' : 'text-red-600'}`}>
                      {icmGeral > ritmoIdeal ? `+${icmGeral - ritmoIdeal}%` : `${icmGeral - ritmoIdeal}%`}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-responsive-sm text-responsive-3xs text-muted-foreground mt-responsive-sm">
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-primary" />
            <span>Ritmo Ideal: {ritmoIdeal}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Performance Indicator */}
      <div className={`mt-responsive p-responsive-sm rounded-lg flex items-center justify-center gap-responsive-sm ${
        icmGeral > ritmoIdeal 
          ? 'bg-green-500/10 border border-green-500/20' 
          : icmGeral === ritmoIdeal 
            ? 'bg-blue-500/10 border border-blue-500/20'
            : 'bg-orange-500/10 border border-orange-500/20'
      }`}>
        {icmGeral > ritmoIdeal && (
          <>
            <CheckCircle className="icon-responsive text-green-600" />
            <span className="text-responsive-sm font-medium text-green-700">Ritmo acima do esperado</span>
          </>
        )}
        {icmGeral === ritmoIdeal && (
          <>
            <Clock className="icon-responsive text-blue-600" />
            <span className="text-responsive-sm font-medium text-blue-700">No Ritmo</span>
          </>
        )}
        {icmGeral < ritmoIdeal && (
          <>
            <AlertTriangle className="icon-responsive text-orange-600" />
            <span className="text-responsive-sm font-medium text-orange-700">Ritmo abaixo do esperado</span>
          </>
        )}
      </div>
    </Card>
  );
}

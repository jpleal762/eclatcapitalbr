import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessors: string[];
  selectedAssessor: string;
  selectedMonth: string;
  months: string[];
  onAssessorChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onToggleView?: () => void;
  isTvMode?: boolean;
}

export function ICMCard({
  icmGeral,
  ritmoIdeal,
  diasUteisRestantes,
  assessors,
  selectedAssessor,
  selectedMonth,
  months,
  onAssessorChange,
  onMonthChange,
  onToggleView,
  isTvMode = false,
}: ICMCardProps) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (Math.min(icmGeral, 100) / 100) * circumference;

  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${monthNames[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
  };

  return (
    <Card className="p-4 shadow-card h-full flex flex-col overflow-hidden">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className={`${isTvMode ? 'text-sm' : 'text-xs'} font-medium text-muted-foreground`}>
          ICM Mensal
        </h3>
        {onToggleView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleView}
            className={`gap-1.5 ${isTvMode ? 'text-sm h-8 px-3' : 'text-xs h-7 px-2'}`}
          >
            <Calendar className={isTvMode ? "h-4 w-4" : "h-3 w-3"} />
            {isTvMode ? "Mensal" : "TV"}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-2 flex-shrink-0">
        <Select value={selectedAssessor} onValueChange={onAssessorChange}>
          <SelectTrigger className="w-[140px] bg-background text-xs h-8">
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

        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[100px] bg-background text-xs h-8">
            <SelectValue placeholder={getCurrentMonthLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start justify-between gap-4 flex-1 min-h-0">
        {/* Gauge */}
        <div className="flex flex-col items-center flex-1">
          <h3 className={`${isTvMode ? 'text-lg' : 'text-sm'} font-semibold mb-1 text-foreground`}>ICM Geral</h3>
          
          <div className="relative" style={{ width: isTvMode ? 160 : 140, height: isTvMode ? 90 : 80 }}>
            <svg width={isTvMode ? "160" : "140"} height={isTvMode ? "90" : "80"} viewBox={isTvMode ? "0 0 160 100" : "0 0 140 90"}>
              <path
                d={isTvMode ? "M 10 90 A 70 70 0 0 1 150 90" : "M 10 80 A 60 60 0 0 1 130 80"}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={isTvMode ? "16" : "12"}
                strokeLinecap="round"
              />
              <path
                d={isTvMode ? "M 10 90 A 70 70 0 0 1 150 90" : "M 10 80 A 60 60 0 0 1 130 80"}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={isTvMode ? "16" : "12"}
                strokeLinecap="round"
                strokeDasharray={Math.PI * (isTvMode ? 70 : 60)}
                strokeDashoffset={Math.PI * (isTvMode ? 70 : 60) - (Math.min(icmGeral, 100) / 100) * Math.PI * (isTvMode ? 70 : 60)}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className={`${isTvMode ? 'text-4xl' : 'text-3xl'} font-bold text-foreground`}>{icmGeral}%</span>
            </div>
          </div>
        </div>

        {/* Days remaining */}
        <div className="text-center px-2 py-1">
          <p className={`${isTvMode ? 'text-sm' : 'text-xs'} text-muted-foreground mb-0.5`}>Dias Úteis<br/>Restantes</p>
          <p className={`${isTvMode ? 'text-3xl' : 'text-2xl'} font-bold text-foreground`}>{diasUteisRestantes}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-auto pt-2 space-y-2 flex-shrink-0">
        {/* ICM Geral em barra amarela com marcador de Ritmo Ideal */}
        <div className="space-y-0.5">
          <div className={`flex justify-between ${isTvMode ? 'text-sm' : 'text-xs'}`}>
            <span className="font-medium text-foreground">ICM Geral</span>
            <span className="font-bold text-foreground">{icmGeral}%</span>
          </div>
          <div className="relative">
            <div className={`${isTvMode ? 'h-3' : 'h-2'} w-full rounded-full bg-muted overflow-hidden`}>
              <div 
                className="h-full rounded-full transition-all duration-500 bg-yellow-500"
                style={{ width: `${Math.min(icmGeral, 100)}%` }}
              />
            </div>
            {/* Marcador do Ritmo Ideal - Triângulo apontando para baixo + linha */}
            <div 
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${Math.min(ritmoIdeal, 100)}%`, transform: 'translateX(-50%)' }}
            >
              {/* Triângulo */}
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary -mt-1" />
              {/* Linha vertical */}
              <div className={`w-0.5 ${isTvMode ? 'h-3' : 'h-2'} bg-primary`} />
            </div>
          </div>
          <div className="flex justify-end text-[10px] text-muted-foreground mt-0.5">
            <span>▲ Ritmo Ideal: {ritmoIdeal}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Performance Indicator */}
      <div className={`mt-2 ${isTvMode ? 'p-3' : 'p-2'} rounded-lg flex items-center justify-center gap-1.5 flex-shrink-0 ${
        icmGeral > ritmoIdeal 
          ? 'bg-green-500/10 border border-green-500/20' 
          : icmGeral === ritmoIdeal 
            ? 'bg-blue-500/10 border border-blue-500/20'
            : 'bg-orange-500/10 border border-orange-500/20'
      }`}>
        {icmGeral > ritmoIdeal && (
          <>
            <CheckCircle className={`${isTvMode ? 'h-5 w-5' : 'h-4 w-4'} text-green-600`} />
            <span className={`${isTvMode ? 'text-sm' : 'text-xs'} font-medium text-green-700`}>Acima do esperado</span>
          </>
        )}
        {icmGeral === ritmoIdeal && (
          <>
            <Clock className={`${isTvMode ? 'h-5 w-5' : 'h-4 w-4'} text-blue-600`} />
            <span className={`${isTvMode ? 'text-sm' : 'text-xs'} font-medium text-blue-700`}>No Ritmo</span>
          </>
        )}
        {icmGeral < ritmoIdeal && (
          <>
            <AlertTriangle className={`${isTvMode ? 'h-5 w-5' : 'h-4 w-4'} text-orange-600`} />
            <span className={`${isTvMode ? 'text-sm' : 'text-xs'} font-medium text-orange-700`}>Abaixo do esperado</span>
          </>
        )}
      </div>
    </Card>
  );
}

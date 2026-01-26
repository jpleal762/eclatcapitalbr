import { SprintKPIData } from "@/types/kpi";
import { SprintKPIBar } from "./SprintKPIBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";

interface SprintPageProps {
  sprintData: SprintKPIData[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
}

export function SprintPage({
  sprintData,
  assessors,
  months,
  selectedAssessor,
  selectedMonth,
  onAssessorChange,
  onMonthChange,
  isLocked = false,
}: SprintPageProps) {
  // Sort by remaining (highest first), completed at end
  const sortedData = [...sprintData].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.totalRemaining - a.totalRemaining;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Sprint Semanal</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Objetivo: Zerar o que falta da meta semanal
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedAssessor}
            onValueChange={onAssessorChange}
            disabled={isLocked}
          >
            <SelectTrigger className="w-[140px] lg:w-[180px] h-8 text-xs lg:text-sm">
              <SelectValue placeholder="Assessor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Assessores</SelectItem>
              {assessors.map((assessor) => (
                <SelectItem key={assessor} value={assessor}>
                  {assessor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[100px] lg:w-[120px] h-8 text-xs lg:text-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Bars - Vertical List */}
      <div className="flex-1 flex flex-col gap-2 lg:gap-3 min-h-0 overflow-hidden lg:overflow-hidden">
        {sortedData.map((kpi, index) => (
          <SprintKPIBar key={kpi.category} data={kpi} />
        ))}
      </div>
    </div>
  );
}

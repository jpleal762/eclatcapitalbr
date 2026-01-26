import { SprintKPIData, SprintEvolution, SPRINT_PRODUCTS } from "@/types/kpi";
import { SprintKPIBar } from "./SprintKPIBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SprintPageProps {
  sprintData: SprintKPIData[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
  evolutionMap?: Map<string, SprintEvolution>;
  selectedProducts: Set<string>;
  onProductToggle: (category: string) => void;
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
  evolutionMap,
  selectedProducts,
  onProductToggle,
}: SprintPageProps) {
  // Sort by remaining (highest first), completed at end
  const sortedData = [...sprintData].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.totalRemaining - a.totalRemaining;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Filtros e checkboxes no topo */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0 flex-wrap">
        {/* Checkboxes de produtos - linha compacta */}
        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          {SPRINT_PRODUCTS.map((product) => (
            <label 
              key={product.category} 
              className="flex items-center gap-1 lg:gap-1.5 cursor-pointer text-[10px] lg:text-xs"
            >
              <Checkbox
                checked={selectedProducts.has(product.category)}
                onCheckedChange={() => onProductToggle(product.category)}
                className="h-3 w-3 lg:h-4 lg:w-4"
              />
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                {product.label}
              </span>
            </label>
          ))}
        </div>
        
        {/* Filtros existentes */}
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
      <div className="flex-1 flex flex-col gap-1 lg:gap-1.5 min-h-0 overflow-hidden">
        {sortedData.length > 0 ? (
          sortedData.map((kpi) => (
            <SprintKPIBar 
              key={kpi.category} 
              data={kpi} 
              evolution={evolutionMap?.get(kpi.category)}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecione ao menos um produto
          </div>
        )}
      </div>
    </div>
  );
}

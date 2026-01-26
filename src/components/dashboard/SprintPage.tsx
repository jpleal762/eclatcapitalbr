import { useState, useCallback } from "react";
import { SprintKPIData, SprintGlobalStats, SprintEvolution, SprintEvolution48h, SPRINT_PRODUCTS } from "@/types/kpi";
import { SprintKPIBar } from "./SprintKPIBar";
import { SprintHeader } from "./SprintHeader";

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
  evolution48h?: SprintEvolution48h | null;
}

// Calculate global stats from sprint data
function calculateGlobalStats(sprintData: SprintKPIData[]): SprintGlobalStats {
  // Only consider currency KPIs for monetary totals
  const currencyKPIs = sprintData.filter(k => k.isCurrency);
  
  const totalObjective = currencyKPIs.reduce((sum, k) => sum + k.totalTarget, 0);
  const totalProduced = currencyKPIs.reduce((sum, k) => sum + k.totalRealized, 0);
  const totalStillMissing = currencyKPIs.reduce((sum, k) => sum + k.totalRemaining, 0);
  
  const globalProgressPercentage = totalObjective > 0 
    ? (totalProduced / totalObjective) * 100 
    : 100;
  
  const kpisCompleted = sprintData.filter(k => k.isCompleted).length;
  const kpisTotal = sprintData.length;

  return {
    totalObjective,
    totalProduced,
    totalStillMissing,
    globalProgressPercentage,
    kpisCompleted,
    kpisTotal,
  };
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
  evolution48h,
}: SprintPageProps) {
  // State for selected products - default all enabled
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    SPRINT_PRODUCTS.map(p => p.category)
  );

  // Toggle product selection
  const handleProductToggle = useCallback((category: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(category)) {
        // Don't allow deselecting all products
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  // Filter sprint data based on selected products
  const filteredSprintData = sprintData.filter(kpi => 
    selectedProducts.includes(kpi.category)
  );

  // Calculate global stats from filtered data
  const globalStats = calculateGlobalStats(filteredSprintData);

  // Sort by remaining (highest first), completed at end
  const sortedData = [...filteredSprintData].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.totalRemaining - a.totalRemaining;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Hero Header */}
      <SprintHeader
        globalStats={globalStats}
        assessors={assessors}
        months={months}
        selectedAssessor={selectedAssessor}
        selectedMonth={selectedMonth}
        onAssessorChange={onAssessorChange}
        onMonthChange={onMonthChange}
        isLocked={isLocked}
        evolution48h={evolution48h}
        availableProducts={SPRINT_PRODUCTS}
        selectedProducts={selectedProducts}
        onProductToggle={handleProductToggle}
      />

      {/* KPI Bars - Vertical List */}
      <div className="flex-1 flex flex-col gap-2 lg:gap-3 min-h-0 overflow-hidden lg:overflow-hidden">
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

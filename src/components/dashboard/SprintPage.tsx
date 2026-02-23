import { useState, useEffect, useCallback } from "react";
import { SprintKPIData, SprintEvolution, SPRINT_PRODUCTS, SprintChallenge } from "@/types/kpi";
import { SprintKPIBar } from "./SprintKPIBar";
import { SprintChallengeModal } from "./SprintChallengeModal";
import { SprintChallengeCard } from "./SprintChallengeCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [challenges, setChallenges] = useState<SprintChallenge[]>([]);

  const fetchChallenges = useCallback(async () => {
    const { data } = await supabase
      .from("sprint_challenges" as any)
      .select("*")
      .eq("month", selectedMonth)
      .eq("is_active", true) as any;
    setChallenges((data as SprintChallenge[]) || []);
  }, [selectedMonth]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Sort by remaining (highest first), completed at end
  const sortedData = [...sprintData].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.totalRemaining - a.totalRemaining;
  });

  // Handle product toggle with max 3 limit
  const handleProductToggle = (category: string) => {
    if (selectedProducts.has(category)) {
      // Can always uncheck
      onProductToggle(category);
    } else {
      // Can only check if less than 3 selected
      if (selectedProducts.size < 3) {
        onProductToggle(category);
      } else {
        toast({
          title: "Limite atingido",
          description: "Máximo de 3 itens selecionados",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Filtros e checkboxes no topo */}
      <div className="flex items-center justify-between gap-1 mb-1 flex-shrink-0 flex-wrap">
        {/* Checkboxes de produtos - linha compacta */}
        <div className="flex items-center gap-1 lg:gap-1.5 flex-wrap">
          <span className="text-scale-5 text-muted-foreground">
            ({selectedProducts.size}/3)
          </span>
          {SPRINT_PRODUCTS.map((product) => (
            <label 
              key={product.category} 
              className="flex items-center gap-1 lg:gap-1.5 cursor-pointer text-scale-5 lg:text-scale-6"
            >
              <Checkbox
                checked={selectedProducts.has(product.category)}
                onCheckedChange={() => handleProductToggle(product.category)}
                className="size-scale-1.5 lg:size-scale-2"
              />
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                {product.label}
              </span>
            </label>
          ))}
        </div>
        
        {/* Filtros existentes */}
        <div className="flex items-center gap-1">
          <SprintChallengeModal
            assessors={assessors}
            selectedMonth={selectedMonth}
            onChallengeCreated={fetchChallenges}
          />

          <Select
            value={selectedAssessor}
            onValueChange={onAssessorChange}
            disabled={isLocked}
          >
            <SelectTrigger className="w-[100px] lg:w-[140px] h-scale-3 text-scale-6 lg:text-scale-7">
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
            <SelectTrigger className="w-[70px] lg:w-[90px] h-scale-3 text-scale-6 lg:text-scale-7">
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
      <div className="flex-1 flex flex-col gap-0.5 lg:gap-[3px] min-h-0 overflow-hidden">
        {sortedData.length > 0 ? (
          sortedData.map((kpi) => (
            <SprintKPIBar 
              key={kpi.category} 
              data={kpi} 
              evolution={evolutionMap?.get(kpi.category)}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-scale-6">
            Selecione ao menos um produto
          </div>
        )}
      </div>

      {/* Desafios Ativos */}
      {challenges.length > 0 && (
        <div className="flex-shrink-0 mt-1">
          <span className="text-scale-5 text-muted-foreground font-medium">Desafios</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mt-0.5">
            {challenges.map(c => (
              <SprintChallengeCard
                key={c.id}
                challenge={c}
                sprintData={sprintData}
                onDelete={fetchChallenges}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

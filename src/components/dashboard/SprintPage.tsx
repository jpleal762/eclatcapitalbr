import { useState, useEffect, useCallback, useMemo } from "react";
import { SprintKPIData, SprintEvolution, SPRINT_PRODUCTS, SprintChallenge } from "@/types/kpi";
import { SprintChallengeModal } from "./SprintChallengeModal";
import { SprintAssessorCard } from "./SprintAssessorCard";
import { SprintChallengeSummary } from "./SprintChallengeSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      {/* Filtros no topo */}
      <div className="flex items-center justify-end gap-1 mb-2 flex-shrink-0">
        <SprintChallengeModal
          assessors={assessors}
          selectedMonth={selectedMonth}
          onChallengeCreated={fetchChallenges}
        />

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

      {/* Desafios */}
      <div className="flex-1 min-h-0 overflow-auto">
        {challenges.length > 0 ? (
          <>
            <SprintChallengeSummary challenges={challenges} sprintData={sprintData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {Object.entries(
                challenges.reduce<Record<string, SprintChallenge[]>>((acc, c) => {
                  (acc[c.assessor_name] ??= []).push(c);
                  return acc;
                }, {})
              ).map(([name, group]) => (
                <SprintAssessorCard
                  key={name}
                  assessorName={name}
                  challenges={group}
                  sprintData={sprintData}
                  onDelete={fetchChallenges}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-scale-7 h-32">
            Nenhum desafio ativo. Clique em "+ Desafio" para criar.
          </div>
        )}
      </div>
    </div>
  );
}

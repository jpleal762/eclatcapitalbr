import { useState, useEffect, useCallback } from "react";
import { SprintKPIData, SprintEvolution, SPRINT_PRODUCTS, SprintChallenge } from "@/types/kpi";
import { SprintChallengeModal } from "./SprintChallengeModal";
import { SprintAssessorCard } from "./SprintAssessorCard";
import { SprintChallengeSummary } from "./SprintChallengeSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

function useLiveCountdown(deadline: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return { label: "--", urgent: false, expired: false };

  const end = new Date(deadline).getTime();
  const diff = end - now;
  if (diff <= 0) return { label: "Expirado", urgent: false, expired: true };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  let label: string;
  if (days > 0) {
    label = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    label = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return { label, urgent: totalSeconds < 86400, expired: false };
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

  const nearestDeadline = challenges.length > 0
    ? challenges
        .map(c => c.deadline)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
    : null;

  const countdown = useLiveCountdown(nearestDeadline);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header com título e relógio */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
        <h2 className="text-scale-8 lg:text-scale-9 font-bold">Sprint Combinado</h2>
        <div className="flex items-center gap-1">
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
      </div>

      {/* Relógio destaque */}
      {challenges.length > 0 && (
        <div className={cn(
          "rounded-lg border p-3 mb-3 text-center transition-all",
          countdown.expired && "border-muted bg-muted/20",
          countdown.urgent && !countdown.expired && "border-destructive bg-destructive/5",
          !countdown.urgent && !countdown.expired && "border-primary/30 bg-primary/5"
        )}>
          <div className="text-scale-5 text-muted-foreground mb-0.5">⏱ Tempo restante</div>
          <div className={cn(
            "text-scale-10 lg:text-scale-11 font-mono font-bold tracking-wider",
            countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-destructive" : "text-foreground"
          )}>
            {countdown.label}
          </div>
        </div>
      )}

      {/* Desafios */}
      <div className="flex-1 min-h-0 overflow-auto">
        {challenges.length > 0 ? (
          <>
            <SprintChallengeSummary challenges={challenges} />
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
                  onDelete={fetchChallenges}
                  onUpdated={fetchChallenges}
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

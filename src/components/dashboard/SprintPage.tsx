import { useState, useEffect, useCallback } from "react";
import { SprintKPIData, SprintEvolution, SPRINT_PRODUCTS, SprintChallenge } from "@/types/kpi";
import { SprintChallengeModal } from "./SprintChallengeModal";
import { SprintAssessorCard } from "./SprintAssessorCard";
import { SprintChallengeSummary } from "./SprintChallengeSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
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

function DeadlineEditor({ challenges, onUpdated }: { challenges: SprintChallenge[]; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && challenges.length > 0) {
      const nearest = challenges
        .map(c => c.deadline)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
      const d = new Date(nearest);
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr(d.toISOString().slice(11, 16));
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    if (!dateStr || !timeStr) return;
    setSaving(true);
    try {
      const newDeadline = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      const ids = challenges.map(c => c.id);
      const { error } = await supabase
        .from("sprint_challenges" as any)
        .update({ deadline: newDeadline } as any)
        .in("id", ids);
      if (error) throw error;
      toast({ title: "Prazo atualizado para todos os desafios ⏱" });
      setOpen(false);
      onUpdated();
    } catch {
      toast({ title: "Erro ao atualizar prazo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-60 hover:opacity-100"
        >
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Ajustar Prazo Geral ⏱</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hora</Label>
            <Input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving || !dateStr || !timeStr}>
            {saving ? "Salvando..." : "Atualizar Prazo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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
        <h2 className="text-2xl lg:text-4xl font-black tracking-tight">🏆 Sprint Combinado</h2>
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
          "rounded-lg border p-4 mb-3 text-center transition-all relative",
          countdown.expired && "border-muted bg-muted/20",
          countdown.urgent && !countdown.expired && "border-destructive bg-destructive/5",
          !countdown.urgent && !countdown.expired && "border-primary/30 bg-primary/5"
        )}>
          <div className={cn(
            "text-base lg:text-lg font-semibold mb-1",
            countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-destructive/80" : "text-muted-foreground"
          )}>⏱ Tempo restante</div>
          <div className={cn(
            "text-5xl lg:text-7xl font-mono font-black tracking-wider leading-none",
            countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-destructive" : "text-foreground"
          )}>
            {countdown.label}
          </div>
          {/* Botão editar prazo */}
          <DeadlineEditor
            challenges={challenges}
            onUpdated={fetchChallenges}
          />
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

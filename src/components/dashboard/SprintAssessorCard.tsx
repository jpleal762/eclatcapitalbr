import { SprintChallenge, SPRINT_PRODUCTS } from "@/types/kpi";
import { SprintMascot } from "./SprintMascot";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { X, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SprintAssessorCardProps {
  assessorName: string;
  challenges: SprintChallenge[];
  onDelete: () => void;
  onUpdated: () => void;
}

function getCountdown(deadline: string): { label: string; urgent: boolean; expired: boolean } {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;
  if (diff <= 0) return { label: "Expirado", urgent: false, expired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return { label: `${days}d ${remainingHours}h`, urgent: hours < 24, expired: false };
  return { label: `${remainingHours}h`, urgent: true, expired: false };
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`;
    return `R$${value.toFixed(0)}`;
  }
  return value.toFixed(0);
}

interface KPIRow {
  challenge: SprintChallenge;
  realized: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
  isCurrency: boolean;
  label: string;
}

export function SprintAssessorCard({ assessorName, challenges, onDelete, onUpdated }: SprintAssessorCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<"realized" | "target">("realized");
  const [editValue, setEditValue] = useState("");

  const rows: KPIRow[] = challenges.map(c => {
    const realized = c.realized_value ?? 0;
    const target = c.target_value;
    const percentage = target > 0 ? Math.min((realized / target) * 100, 100) : 0;
    const product = SPRINT_PRODUCTS.find(p => p.category === c.category);
    return {
      challenge: c,
      realized,
      target,
      percentage,
      isCompleted: percentage >= 100,
      isCurrency: product?.isCurrency ?? false,
      label: product?.label ?? c.category,
    };
  });

  const totalTarget = rows.reduce((s, r) => s + r.target, 0);
  const totalRealized = rows.reduce((s, r) => s + r.realized, 0);
  const globalPercentage = totalTarget > 0 ? Math.min((totalRealized / totalTarget) * 100, 100) : 0;
  const allCompleted = rows.every(r => r.isCompleted);
  const completedCount = rows.filter(r => r.isCompleted).length;

  const nearestDeadline = challenges
    .map(c => c.deadline)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  const countdown = getCountdown(nearestDeadline);

  const handleDeleteKPI = async (id: string) => {
    setDeletingId(id);
    await supabase.from("sprint_challenges" as any).delete().eq("id", id);
    onDelete();
  };

  const startEditing = (challenge: SprintChallenge, field: "realized" | "target") => {
    setEditingId(challenge.id);
    setEditField(field);
    setEditValue(String(field === "realized" ? (challenge.realized_value ?? 0) : challenge.target_value));
  };

  const saveEdit = async (id: string) => {
    const numValue = parseFloat(editValue) || 0;
    const updateData = editField === "realized"
      ? { realized_value: numValue }
      : { target_value: numValue };

    const { error } = await supabase
      .from("sprint_challenges" as any)
      .update(updateData as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: editField === "realized" ? "Produção atualizada! ✅" : "Meta atualizada! ✅" });
      onUpdated();
    }
    setEditingId(null);
  };

  const globalBarColor = countdown.expired
    ? "bg-muted"
    : allCompleted
    ? "bg-green-500"
    : globalPercentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className={cn(
      "rounded-lg border p-3 lg:p-4 transition-all",
      countdown.expired && "opacity-60 border-muted",
      countdown.urgent && !allCompleted && !countdown.expired && "border-red-500 animate-pulse",
      allCompleted && !countdown.expired && "border-green-500/50 bg-green-500/5"
    )}>
      <ConfettiCelebration trigger={allCompleted && !countdown.expired} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <SprintMascot
          progressPercent={globalPercentage}
          isCompleted={allCompleted && !countdown.expired}
          className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-scale-7 lg:text-scale-8 font-bold truncate">
              {assessorName.split(" ")[0]}
            </span>
            <span className={cn(
              "text-scale-5 lg:text-scale-6 font-bold whitespace-nowrap",
              countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-red-500" : "text-muted-foreground"
            )}>
              ⏱ {countdown.label}
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", globalBarColor)}
              style={{ width: `${globalPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-scale-5 text-muted-foreground">
              {globalPercentage.toFixed(0)}% geral
            </span>
            <span className="text-scale-5 text-muted-foreground">
              {completedCount}/{rows.length} KPIs
            </span>
          </div>
        </div>
      </div>

      {/* KPI rows */}
      <div className="space-y-1.5 mt-2">
        {rows.map(r => {
          const barColor = countdown.expired
            ? "bg-muted"
            : r.isCompleted
            ? "bg-green-500"
            : r.percentage >= 50
            ? "bg-yellow-500"
            : "bg-red-500";

          const isEditing = editingId === r.challenge.id;

          return (
            <div key={r.challenge.id} className="group flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-scale-5 lg:text-scale-6 font-medium truncate">
                    {r.label}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveEdit(r.challenge.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-6 w-24 text-xs text-right"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(r.challenge.id)}
                        className="text-green-500 hover:text-green-600 transition-colors"
                      >
                        <Check className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-scale-5 text-muted-foreground">
                      <button
                        onClick={() => startEditing(r.challenge, "realized")}
                        className="hover:text-foreground hover:underline transition-colors"
                        title="Editar realizado"
                      >
                        {formatValue(r.realized, r.isCurrency)}
                      </button>
                      <span>/</span>
                      <button
                        onClick={() => startEditing(r.challenge, "target")}
                        className="hover:text-foreground hover:underline transition-colors"
                        title="Editar meta"
                      >
                        {formatValue(r.target, r.isCurrency)}
                      </button>
                      <Pencil className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                    </div>
                  )}
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{ width: `${r.percentage}%` }} />
                </div>
              </div>
              <span className="text-scale-5 font-semibold w-8 text-right">
                {r.percentage.toFixed(0)}%
              </span>
              <button
                onClick={() => handleDeleteKPI(r.challenge.id)}
                disabled={deletingId === r.challenge.id}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

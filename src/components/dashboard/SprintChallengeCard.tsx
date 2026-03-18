import { SprintChallenge, SprintKPIData, SPRINT_PRODUCTS } from "@/types/kpi";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { cn } from "@/lib/utils";
import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { X } from "lucide-react";
import { useState } from "react";

interface SprintChallengeCardProps {
  challenge: SprintChallenge;
  sprintData: SprintKPIData[];
  onDelete: () => void;
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

export function SprintChallengeCard({ challenge, sprintData, onDelete }: SprintChallengeCardProps) {
  const [deleting, setDeleting] = useState(false);
  const kpiData = sprintData.find(s => s.category === challenge.category);
  const assessorData = kpiData?.assessorBreakdown.find(a => a.name === challenge.assessor_name);
  const realized = assessorData?.contribution ?? 0;
  const target = challenge.target_value;
  const percentage = target > 0 ? Math.min((realized / target) * 100, 100) : 0;
  const isCompleted = percentage >= 100;
  const product = SPRINT_PRODUCTS.find(p => p.category === challenge.category);
  const isCurrency = product?.isCurrency ?? false;
  const countdown = getCountdown(challenge.deadline);

  const barColor = countdown.expired
    ? "bg-muted"
    : isCompleted
    ? "bg-green-500"
    : percentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = getAuthedClient();
    await supabase.from("sprint_challenges" as any).delete().eq("id", challenge.id);
    onDelete();
  };

  return (
    <div className={cn(
      "relative rounded-lg border p-2 lg:p-3 transition-all",
      countdown.expired && "opacity-60 border-muted",
      countdown.urgent && !isCompleted && !countdown.expired && "border-red-500 animate-pulse",
      isCompleted && "border-green-500/50 bg-green-500/5"
    )}>
      <ConfettiCelebration trigger={isCompleted && !countdown.expired} />
      <button onClick={handleDelete} disabled={deleting}
        className="absolute top-1 right-1 text-muted-foreground hover:text-foreground transition-colors">
        <X className="size-3" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-[55%] leading-none">É</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-scale-6 font-semibold truncate">
              {challenge.assessor_name.split(" ")[0]} · {product?.label}
            </span>
            <span className={cn("text-scale-5 font-bold whitespace-nowrap",
              countdown.expired ? "text-muted-foreground" : countdown.urgent ? "text-red-500" : "text-muted-foreground"
            )}>{countdown.label}</span>
          </div>
          <div className="w-full h-1.5 lg:h-2 bg-secondary rounded-full mt-1 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", barColor)}
              style={{ width: `${percentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-scale-5 text-muted-foreground">
              {formatValue(realized, isCurrency)} / {formatValue(target, isCurrency)} ({percentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

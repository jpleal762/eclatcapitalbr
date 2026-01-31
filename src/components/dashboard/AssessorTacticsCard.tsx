import { cn } from "@/lib/utils";
import { WeeklyTactic } from "@/types/kpi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Avatar colors assigned by index
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
];

// Category badge styling
const CATEGORY_BADGES: Record<string, { bg: string; text: string }> = {
  "Captação NET": { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  "Receita": { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  "Reuniões": { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  "Diversificação": { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  "Prospecção": { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  "Habilitação": { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  "Ativação": { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  "NNM": { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  "Pipeline": { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
  "ROA": { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  "PJ": { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
};

const getDefaultBadge = () => ({ bg: "bg-muted", text: "text-muted-foreground" });

interface AssessorTacticsCardProps {
  assessorName: string;
  tactics: WeeklyTactic[];
  colorIndex: number;
  onStatusChange?: (tacticId: string, newStatus: WeeklyTactic["status"]) => void;
}

export function AssessorTacticsCard({
  assessorName,
  tactics,
  colorIndex,
  onStatusChange,
}: AssessorTacticsCardProps) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const initials = assessorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleToggle = (tactic: WeeklyTactic) => {
    if (!onStatusChange) return;
    const newStatus: WeeklyTactic["status"] =
      tactic.status === "done" ? "pending" : "done";
    onStatusChange(tactic.id, newStatus);
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={cn(avatarColor, "text-white font-semibold text-sm")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-foreground text-base">{assessorName}</span>
      </div>

      {/* Tactics List */}
      <div className="flex-1 flex flex-col gap-3">
        {tactics.map((tactic, index) => {
          const badge = CATEGORY_BADGES[tactic.category] || getDefaultBadge();
          const isDone = tactic.status === "done";

          return (
            <div
              key={tactic.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all",
                isDone
                  ? "bg-emerald-500/5 border border-emerald-500/20"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Checkbox */}
              <div className="mt-0.5">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={() => handleToggle(tactic)}
                  className="h-5 w-5"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium text-muted-foreground",
                      isDone && "line-through"
                    )}
                  >
                    {index + 1}.
                  </span>
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-foreground",
                      isDone && "line-through text-muted-foreground"
                    )}
                  >
                    {tactic.text}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-2 py-0.5 font-normal border-0",
                    badge.bg,
                    badge.text
                  )}
                >
                  {tactic.category}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

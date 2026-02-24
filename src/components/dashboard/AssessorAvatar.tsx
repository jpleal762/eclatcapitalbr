import { cn } from "@/lib/utils";

interface AssessorAvatarProps {
  assessorName: string;
  className?: string;
}

const COLOR_MAP: Record<string, string> = {
  jose: "bg-blue-500",
  josé: "bg-blue-500",
  marcela: "bg-pink-500",
  hingrid: "bg-purple-500",
  romulo: "bg-emerald-500",
  rômulo: "bg-emerald-500",
  ona: "bg-amber-500",
  onacilda: "bg-amber-500",
};

export function AssessorAvatar({ assessorName, className }: AssessorAvatarProps) {
  const firstName = assessorName.split(" ")[0].toLowerCase();
  const initial = assessorName.charAt(0).toUpperCase();
  const bgColor = COLOR_MAP[firstName] ?? "bg-muted";

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-black text-white select-none",
      bgColor,
      className
    )}>
      <span className="text-[55%] leading-none">{initial}</span>
    </div>
  );
}

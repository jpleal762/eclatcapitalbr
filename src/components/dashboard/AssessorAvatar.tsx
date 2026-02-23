import { cn } from "@/lib/utils";

interface AssessorAvatarProps {
  assessorName: string;
  className?: string;
}

function JoseAvatar() {
  return (
    <svg viewBox="0 0 64 64">
      {/* Rosto */}
      <circle cx="32" cy="30" r="20" fill="#FDDCB5" />
      {/* Cabelo preto - menino */}
      <path d="M12 28c0-14 8-22 20-22s20 8 20 22c0 0-4-12-20-12S12 28 12 28z" fill="#1a1a1a" />
      <rect x="12" y="18" width="40" height="6" rx="3" fill="#1a1a1a" />
      {/* Olhos */}
      <circle cx="24" cy="30" r="2.5" fill="#333" />
      <circle cx="40" cy="30" r="2.5" fill="#333" />
      <circle cx="25" cy="29" r="0.8" fill="white" />
      <circle cx="41" cy="29" r="0.8" fill="white" />
      {/* Sorriso */}
      <path d="M25 38a8 8 0 0 0 14 0" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Corpo */}
      <path d="M18 50c0-8 6-12 14-12s14 4 14 12" fill="#3B82F6" />
    </svg>
  );
}

function MarcelaAvatar() {
  return (
    <svg viewBox="0 0 64 64">
      {/* Rosto */}
      <circle cx="32" cy="30" r="20" fill="#8D5524" />
      {/* Cabelo preto longo */}
      <path d="M10 30c0-16 8-26 22-26s22 10 22 26c0 0-2-16-22-16S10 30 10 30z" fill="#0a0a0a" />
      <path d="M10 30c-1 10 0 22 4 28l2-20z" fill="#0a0a0a" />
      <path d="M54 30c1 10 0 22-4 28l-2-20z" fill="#0a0a0a" />
      {/* Olhos */}
      <circle cx="24" cy="30" r="2.5" fill="#1a1a1a" />
      <circle cx="40" cy="30" r="2.5" fill="#1a1a1a" />
      <circle cx="25" cy="29" r="0.8" fill="white" />
      <circle cx="41" cy="29" r="0.8" fill="white" />
      {/* Cílios */}
      <path d="M21 27l-2-2M23 26l-1-2" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M43 27l2-2M41 26l1-2" stroke="#1a1a1a" strokeWidth="0.8" />
      {/* Sorriso */}
      <path d="M25 37a8 8 0 0 0 14 0" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Corpo */}
      <path d="M18 50c0-8 6-12 14-12s14 4 14 12" fill="#EC4899" />
    </svg>
  );
}

function HingridAvatar() {
  return (
    <svg viewBox="0 0 64 64">
      {/* Rosto */}
      <circle cx="32" cy="30" r="20" fill="#FDDCB5" />
      {/* Cabelo loiro longo */}
      <path d="M10 30c0-16 8-26 22-26s22 10 22 26c0 0-2-16-22-16S10 30 10 30z" fill="#F2C94C" />
      <path d="M10 30c-1 10 0 20 3 26l2-18z" fill="#F2C94C" />
      <path d="M54 30c1 10 0 20-3 26l-2-18z" fill="#F2C94C" />
      {/* Olhos */}
      <circle cx="24" cy="30" r="2.5" fill="#2D6A4F" />
      <circle cx="40" cy="30" r="2.5" fill="#2D6A4F" />
      <circle cx="25" cy="29" r="0.8" fill="white" />
      <circle cx="41" cy="29" r="0.8" fill="white" />
      {/* Cílios */}
      <path d="M21 27l-2-2M23 26l-1-2" stroke="#333" strokeWidth="0.8" />
      <path d="M43 27l2-2M41 26l1-2" stroke="#333" strokeWidth="0.8" />
      {/* Sorriso */}
      <path d="M25 37a8 8 0 0 0 14 0" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Corpo */}
      <path d="M18 50c0-8 6-12 14-12s14 4 14 12" fill="#8B5CF6" />
    </svg>
  );
}

function RomuloAvatar() {
  return (
    <svg viewBox="0 0 64 64">
      {/* Rosto */}
      <circle cx="32" cy="30" r="20" fill="#D4A574" />
      {/* Cabelo preto curto */}
      <path d="M12 26c0-14 8-20 20-20s20 6 20 20c0 0-4-10-20-10S12 26 12 26z" fill="#1a1a1a" />
      <rect x="12" y="16" width="40" height="7" rx="3" fill="#1a1a1a" />
      {/* Sobrancelhas */}
      <path d="M20 25h8" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 25h8" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Olhos */}
      <circle cx="24" cy="30" r="2.5" fill="#333" />
      <circle cx="40" cy="30" r="2.5" fill="#333" />
      <circle cx="25" cy="29" r="0.8" fill="white" />
      <circle cx="41" cy="29" r="0.8" fill="white" />
      {/* Sorriso */}
      <path d="M26 38a7 7 0 0 0 12 0" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Corpo */}
      <path d="M16 50c0-8 7-12 16-12s16 4 16 12" fill="#10B981" />
    </svg>
  );
}

function OnaAvatar() {
  return (
    <svg viewBox="0 0 64 64">
      {/* Rosto */}
      <circle cx="32" cy="30" r="20" fill="#D4A574" />
      {/* Cabelo preto longo */}
      <path d="M10 30c0-16 8-26 22-26s22 10 22 26c0 0-2-16-22-16S10 30 10 30z" fill="#0a0a0a" />
      <path d="M10 30c-1 8 0 18 3 24l2-16z" fill="#0a0a0a" />
      <path d="M54 30c1 8 0 18-3 24l-2-16z" fill="#0a0a0a" />
      {/* Olhos */}
      <circle cx="24" cy="30" r="2.5" fill="#1a1a1a" />
      <circle cx="40" cy="30" r="2.5" fill="#1a1a1a" />
      <circle cx="25" cy="29" r="0.8" fill="white" />
      <circle cx="41" cy="29" r="0.8" fill="white" />
      {/* Cílios */}
      <path d="M21 27l-2-2M23 26l-1-2" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M43 27l2-2M41 26l1-2" stroke="#1a1a1a" strokeWidth="0.8" />
      {/* Sorriso */}
      <path d="M25 37a8 8 0 0 0 14 0" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Corpo */}
      <path d="M18 50c0-8 6-12 14-12s14 4 14 12" fill="#F59E0B" />
    </svg>
  );
}

function DefaultAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <svg viewBox="0 0 64 64">
      <circle cx="32" cy="30" r="20" fill="hsl(var(--muted))" />
      <text x="32" y="36" textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--muted-foreground))">
        {initial}
      </text>
      <path d="M18 50c0-8 6-12 14-12s14 4 14 12" fill="hsl(var(--muted))" />
    </svg>
  );
}

const AVATAR_MAP: Record<string, () => JSX.Element> = {
  jose: JoseAvatar,
  josé: JoseAvatar,
  marcela: MarcelaAvatar,
  hingrid: HingridAvatar,
  romulo: RomuloAvatar,
  rômulo: RomuloAvatar,
  ona: OnaAvatar,
};

export function AssessorAvatar({ assessorName, className }: AssessorAvatarProps) {
  const firstName = assessorName.split(" ")[0].toLowerCase();
  const AvatarComponent = AVATAR_MAP[firstName];

  return (
    <div className={cn("rounded-full overflow-hidden bg-muted", className)}>
      {AvatarComponent ? <AvatarComponent /> : <DefaultAvatar name={assessorName} />}
    </div>
  );
}

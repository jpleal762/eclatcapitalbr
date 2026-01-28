import { cn } from "@/lib/utils";

interface SprintMascotProps {
  progressPercent: number;
  isCompleted: boolean;
  className?: string;
}

// Runner (< 50%) - Urgência
function RunnerMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("text-red-400", className)}>
      {/* Cabeça */}
      <circle cx="12" cy="4" r="3" fill="currentColor" />
      {/* Corpo inclinado */}
      <path 
        d="M12 7l2 6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Braços em movimento */}
      <path 
        d="M13 9l4-2M13 9l-3 3" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        className="origin-[13px_9px] animate-runner-arms"
      />
      {/* Pernas correndo */}
      <path 
        d="M14 13l3 5M14 13l-4 4" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        className="origin-[14px_13px] animate-runner-legs"
      />
    </svg>
  );
}

// Cyclist (50-79%) - Progresso
function CyclistMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={cn("text-yellow-500", className)}>
      {/* Roda traseira */}
      <circle 
        cx="7" cy="17" r="5" 
        stroke="currentColor" 
        strokeWidth="1.5"
        fill="none"
      />
      <circle 
        cx="7" cy="17" r="1" 
        fill="currentColor"
        className="origin-[7px_17px] animate-spin-slow"
      />
      {/* Roda dianteira */}
      <circle 
        cx="25" cy="17" r="5" 
        stroke="currentColor" 
        strokeWidth="1.5"
        fill="none"
      />
      <circle 
        cx="25" cy="17" r="1" 
        fill="currentColor"
        className="origin-[25px_17px] animate-spin-slow"
      />
      {/* Quadro da bicicleta */}
      <path 
        d="M7 17l9-7h9M7 17l9 0M16 10v7" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Ciclista */}
      <circle cx="14" cy="5" r="3" fill="currentColor" />
      <path 
        d="M14 8l2 5" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Pernas pedalando */}
      <path 
        d="M16 13l-2 4M16 13l2 4" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        className="origin-[16px_13px] animate-pedal"
      />
    </svg>
  );
}

// Rocket (80-99%) - Quase lá
function RocketMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={cn("text-green-400", className)}>
      {/* Corpo do foguete */}
      <path 
        d="M12 2c-4 4-5 10-5 14h10c0-4-1-10-5-14z" 
        fill="currentColor"
      />
      {/* Janela */}
      <circle cx="12" cy="10" r="2.5" fill="hsl(var(--background))" />
      <circle cx="12" cy="10" r="1.5" fill="hsl(var(--muted))" />
      {/* Aletas */}
      <path 
        d="M7 16l-3 4h3zM17 16l3 4h-3z" 
        fill="currentColor"
      />
      {/* Base */}
      <rect x="8" y="16" width="8" height="4" fill="currentColor" rx="1" />
      {/* Chamas animadas */}
      <path 
        d="M9 20l3 10 3-10" 
        fill="orange"
        className="origin-[12px_20px] animate-flame"
      />
      <path 
        d="M10 20l2 6 2-6" 
        fill="#FFD700"
        className="origin-[12px_20px] animate-flame-inner"
      />
    </svg>
  );
}

// Champion (100%) - Vitória
function ChampionMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-green-500", className)}>
      {/* Estrelas de fundo */}
      <text x="2" y="8" fontSize="6" className="animate-twinkle">✨</text>
      <text x="26" y="10" fontSize="5" className="animate-twinkle-delayed">⭐</text>
      <text x="4" y="28" fontSize="4" className="animate-twinkle">🌟</text>
      
      {/* Cabeça */}
      <circle cx="16" cy="8" r="4" fill="currentColor" />
      {/* Sorriso */}
      <path 
        d="M14 9a2 2 0 0 0 4 0" 
        stroke="hsl(var(--background))" 
        strokeWidth="0.8"
        fill="none"
      />
      {/* Corpo */}
      <path d="M16 12v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Braços levantados em V */}
      <path 
        d="M16 14l-6-6M16 14l6-6" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        className="origin-[16px_14px] animate-celebrate-arms"
      />
      {/* Mãos */}
      <circle cx="10" cy="8" r="2" fill="currentColor" className="animate-celebrate-hands" />
      <circle cx="22" cy="8" r="2" fill="currentColor" className="animate-celebrate-hands" />
      {/* Pernas */}
      <path 
        d="M16 20l-3 6M16 20l3 6" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Troféu no topo */}
      <text x="13" y="5" fontSize="6" className="animate-trophy-bounce">🏆</text>
    </svg>
  );
}

export function SprintMascot({ progressPercent, isCompleted, className }: SprintMascotProps) {
  const sizeClass = "w-8 h-8 lg:w-10 lg:h-10";
  
  if (isCompleted) {
    return <ChampionMascot className={cn(sizeClass, className)} />;
  }
  if (progressPercent >= 80) {
    return <RocketMascot className={cn(sizeClass, className)} />;
  }
  if (progressPercent >= 50) {
    return <CyclistMascot className={cn(sizeClass, className)} />;
  }
  return <RunnerMascot className={cn(sizeClass, className)} />;
}

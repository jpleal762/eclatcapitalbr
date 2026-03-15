import React from "react";
import { Settings, Monitor, Pause, Play } from "lucide-react";
import eclatLogoDark from "@/assets/eclat-xp-logo-dark.svg";

interface TVLayoutProps {
  children: React.ReactNode;
  currentScreen: number;
  totalScreens: number;
  screenDurations: number[];
  timeLeft: number;
  isRotating: boolean;
  onToggleRotation: () => void;
  onOpenConfig: () => void;
  onNavigate: (screen: number) => void;
  lastUpdate: string | null;
  selectedMonth: string;
}

const SCREEN_LABELS = ["Comando do Dia", "Performance KPIs", "Por Assessor", "Reconhecimento"];

export function TVLayout({
  children,
  currentScreen,
  totalScreens,
  screenDurations,
  timeLeft,
  isRotating,
  onToggleRotation,
  onOpenConfig,
  onNavigate,
  lastUpdate,
  selectedMonth,
}: TVLayoutProps) {
  const progressPct = screenDurations[currentScreen] > 0
    ? ((screenDurations[currentScreen] - timeLeft) / screenDurations[currentScreen]) * 100
    : 0;

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-tv-bg text-tv-text font-sans select-none">
      {/* ─── TOP HEADER ─── */}
      <header className="flex items-center gap-4 px-6 py-2 bg-tv-card border-b border-tv-border flex-shrink-0">
        {/* Logo */}
        <img src={eclatLogoDark} alt="Éclat XP" className="h-7 flex-shrink-0" />

        {/* Screen tabs */}
        <div className="flex gap-2 flex-1">
          {SCREEN_LABELS.map((label, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                idx === currentScreen
                  ? "bg-tv-gold text-black"
                  : "text-tv-muted hover:text-tv-text hover:bg-tv-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right side info */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs text-tv-muted">
            Mês: <span className="text-tv-text font-semibold uppercase">{selectedMonth}</span>
          </span>
          {lastUpdate && (
            <span className="text-xs text-tv-muted">
              Atualizado: <span className="text-tv-text">{formatTime(lastUpdate)}</span>
            </span>
          )}
          <TVClock />
          <button
            onClick={onToggleRotation}
            className="p-1.5 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border transition-all"
            title={isRotating ? "Pausar rotação" : "Retomar rotação"}
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenConfig}
            className="p-1.5 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border transition-all"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── PROGRESS BAR ─── */}
      <div className="h-0.5 bg-tv-border flex-shrink-0">
        <div
          className="h-full bg-tv-gold transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ─── CONTENT ─── */}
      <main className="flex-1 overflow-hidden min-h-0">
        {children}
      </main>

      {/* ─── BOTTOM DOTS ─── */}
      <footer className="flex items-center justify-center gap-2 py-1.5 bg-tv-card border-t border-tv-border flex-shrink-0">
        {Array.from({ length: totalScreens }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`rounded-full transition-all ${
              idx === currentScreen
                ? "w-6 h-2 bg-tv-gold"
                : "w-2 h-2 bg-tv-border hover:bg-tv-muted"
            }`}
          />
        ))}
        <span className="text-xs text-tv-muted ml-3">
          {isRotating ? `${timeLeft}s` : "⏸"}
        </span>
      </footer>
    </div>
  );
}

function TVClock() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-sm font-bold text-tv-gold tabular-nums">
      {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

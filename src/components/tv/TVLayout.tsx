import React from "react";
import { Settings, Pause, Play, Maximize2, Minimize2 } from "lucide-react";
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
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isKiosk?: boolean;
  onKioskExit?: () => void;
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
  isFullscreen,
  onToggleFullscreen,
  isKiosk = false,
  onKioskExit,
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
      <header
        className={`flex items-center gap-4 px-8 bg-tv-card border-b border-tv-border flex-shrink-0 transition-all duration-700 ease-in-out ${
          isKiosk ? "opacity-0 pointer-events-none max-h-0 py-0 overflow-hidden" : "opacity-100 max-h-24 py-3"
        }`}
      >
        {/* Logo */}
        <img src={eclatLogoDark} alt="Éclat XP" className="h-9 flex-shrink-0" />

        {/* Screen tabs */}
        <div className="flex gap-2 flex-1">
          {SCREEN_LABELS.map((label, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-all ${
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
        <div className="flex items-center gap-5 flex-shrink-0">
          <span className="text-sm text-tv-muted">
            Mês: <span className="text-tv-text font-semibold uppercase">{selectedMonth}</span>
          </span>
          {lastUpdate && (
            <span className="text-sm text-tv-muted">
              Atualizado: <span className="text-tv-text">{formatTime(lastUpdate)}</span>
            </span>
          )}
          <TVClock />
          <button
            onClick={onToggleRotation}
            className="p-2 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border transition-all"
            title={isRotating ? "Pausar rotação" : "Retomar rotação"}
          >
            {isRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border transition-all"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={onOpenConfig}
            className="p-2 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border transition-all"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── PROGRESS BAR ─── */}
      <div className={`bg-tv-border flex-shrink-0 transition-all duration-700 ${isKiosk ? "h-0" : "h-1"}`}>
        <div
          className="h-full bg-tv-gold transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ─── CONTENT ─── */}
      <main className="flex-1 overflow-hidden min-h-0 relative">
        {children}

        {/* Kiosk exit hint — barely visible, bottom center */}
        {isKiosk && (
          <button
            onClick={onKioskExit}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-tv-card/60 border border-tv-border/40 text-tv-muted/30 text-xs tracking-widest uppercase transition-opacity duration-300 hover:opacity-60"
          >
            toque para sair do modo imersivo
          </button>
        )}
      </main>

      {/* ─── BOTTOM DOTS ─── */}
      <footer
        className={`flex items-center justify-center gap-3 bg-tv-card border-t border-tv-border flex-shrink-0 transition-all duration-700 ease-in-out ${
          isKiosk ? "opacity-0 pointer-events-none max-h-0 py-0 overflow-hidden" : "opacity-100 max-h-16 py-2"
        }`}
      >
        {Array.from({ length: totalScreens }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`rounded-full transition-all ${
              idx === currentScreen
                ? "w-8 h-2.5 bg-tv-gold"
                : "w-2.5 h-2.5 bg-tv-border hover:bg-tv-muted"
            }`}
          />
        ))}
        <span className="text-sm text-tv-muted ml-4">
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
    <span className="text-base font-bold text-tv-gold tabular-nums">
      {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

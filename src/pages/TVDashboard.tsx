import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { TVLayout } from "@/components/tv/TVLayout";
import { useTVScale } from "@/hooks/useTVScale";
import { TVScreen1 } from "@/components/tv/TVScreen1";
import { TVScreen2 } from "@/components/tv/TVScreen2";
import { TVScreen3 } from "@/components/tv/TVScreen3";
import { TVScreen4 } from "@/components/tv/TVScreen4";
import { TVConfig } from "@/components/tv/TVConfig";
import { loadExcelData, getLastUpdateTimestamp } from "@/lib/storage";
import { processKPIData, processDashboardData, getAvailableMonths } from "@/lib/kpiUtils";
import { KPIRecord, DashboardData } from "@/types/kpi";
import { Loader2, WifiOff } from "lucide-react";
import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { useWeeklyActions, WeeklyAction } from "@/components/dashboard/EclatWeeklyActions";

const DEFAULT_DURATIONS = [20, 12, 12, 8];
const DATA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const getCurrentMonthValue = () => {
  const now = new Date();
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${months[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
};

const KIOSK_TIMEOUT = 30_000; // 30 seconds

export default function TVDashboard() {
  const { scale, isFullscreen, toggleFullscreen } = useTVScale();

  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());

  // Rotation state
  const [currentScreen, setCurrentScreen] = useState(0);
  const [screenDurations, setScreenDurations] = useState(DEFAULT_DURATIONS);
  const [isRotating, setIsRotating] = useState(true);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS[0]);

  // Config state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [mensagemDia, setMensagemDia] = useState("");
  const [kpiPrioridade, setKpiPrioridade] = useState("");

  // Weekly actions
  const { actions: weeklyActions } = useWeeklyActions();

  // Kiosk mode
  const [isKiosk, setIsKiosk] = useState(false);
  const kioskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load data ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [data, ts] = await Promise.all([loadExcelData(), getLastUpdateTimestamp()]);
      if (data && data.length > 0) setRawData(data);
      setLastUpdate(ts);
    } catch {}
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };
    init();

    // Auto-refresh every 5 min
    const interval = setInterval(loadData, DATA_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  // ─── Kiosk mode: 30s inactivity → immersive ──────────────────
  const resetKioskTimer = useCallback(() => {
    setIsKiosk(false);
    if (kioskTimerRef.current) clearTimeout(kioskTimerRef.current);
    kioskTimerRef.current = setTimeout(() => setIsKiosk(true), KIOSK_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"] as const;
    events.forEach(e => window.addEventListener(e, resetKioskTimer, { passive: true }));
    resetKioskTimer(); // Start the initial timer
    return () => {
      events.forEach(e => window.removeEventListener(e, resetKioskTimer));
      if (kioskTimerRef.current) clearTimeout(kioskTimerRef.current);
    };
  }, [resetKioskTimer]);

  // ─── Load TV config from Supabase ────────────────────────────
  useEffect(() => {
    const supabase = getAuthedClient();
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("key, value")
          .in("key", ["tv-mensagem-dia", "tv-kpi-prioridade", "tv-screen-durations"]);
        if (data) {
          data.forEach(row => {
            if (row.key === "tv-mensagem-dia") setMensagemDia(row.value);
            if (row.key === "tv-kpi-prioridade") setKpiPrioridade(row.value);
            if (row.key === "tv-screen-durations") {
              try { setScreenDurations(JSON.parse(row.value)); } catch {}
            }
          });
        }
      } catch {}
    };
    loadConfig();
  }, []);

  // ─── Sync selected month with available months ───────────────
  const processedData = useMemo(() => processKPIData(rawData), [rawData]);
  const availableMonths = useMemo(() => getAvailableMonths(processedData), [processedData]);

  useEffect(() => {
    if (availableMonths.length > 0) {
      const current = getCurrentMonthValue();
      const normalize = (m: string) => m.toLowerCase().replace(/[\/\-]/g, "");
      const found = availableMonths.find(m => normalize(m) === normalize(current));
      setSelectedMonth(found || availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths]);

  // ─── Dashboard data ──────────────────────────────────────────
  const dashboardData: DashboardData = useMemo(() => {
    if (processedData.length === 0) {
      return {
        icmGeral: 0, ritmoIdeal: 0, diasUteisRestantes: 0, totalDiasUteis: 0,
        diasUteisDecorridos: 0, metaSemanalReal: 0, metaSemanal: [],
        metaSemanalPercentage: 0, assessorPerformance: [], gaugeKPIs: [], headBruno: [],
      };
    }
    return processDashboardData(processedData, selectedMonth, "all");
  }, [processedData, selectedMonth]);

  // ─── Rotation timer ──────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeLeft(screenDurations[currentScreen]);

    if (!isRotating) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCurrentScreen(s => {
            const next = (s + 1) % 4;
            setTimeLeft(screenDurations[next]);
            return next;
          });
          return screenDurations[currentScreen];
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRotating, currentScreen, screenDurations]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrentScreen(s => (s + 1) % 4);
      if (e.key === "ArrowLeft") setCurrentScreen(s => (s - 1 + 4) % 4);
      if (e.key === " ") setIsRotating(r => !r);
      if (e.key === "Escape") setIsConfigOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Navigate with full reset
  const handleNavigate = (idx: number) => {
    setCurrentScreen(idx);
    setTimeLeft(screenDurations[idx]);
  };

  // ─── Render ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-tv-bg">
        <div className="flex flex-col items-center gap-4 text-tv-muted">
          <Loader2 className="w-10 h-10 animate-spin text-tv-gold" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-tv-bg">
        <div className="flex flex-col items-center gap-4 text-tv-muted text-center max-w-sm">
          <WifiOff className="w-12 h-12 text-tv-red" />
          <h2 className="text-xl font-bold text-tv-text">Sem dados disponíveis</h2>
          <p className="text-sm">Faça upload da planilha no dashboard principal para carregar os dados.</p>
          <a href="/" className="mt-2 px-4 py-2 bg-tv-gold text-black font-bold rounded-lg text-sm hover:bg-tv-gold/90 transition-all">
            Ir ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  const screens = [
    <TVScreen1
      key="s1"
      data={dashboardData}
      mensagemDia={mensagemDia}
      kpiPrioridade={kpiPrioridade}
    />,
    <TVScreen2
      key="s2"
      gaugeKPIs={dashboardData.gaugeKPIs}
      ritmoIdeal={dashboardData.ritmoIdeal}
    />,
    <TVScreen3
      key="s3"
      processedData={processedData}
      assessorPerformance={dashboardData.assessorPerformance}
      gaugeKPIs={dashboardData.gaugeKPIs}
      ritmoIdeal={dashboardData.ritmoIdeal}
      selectedMonth={selectedMonth}
    />,
    <TVScreen4
      key="s4"
      assessorPerformance={dashboardData.assessorPerformance}
      gaugeKPIs={dashboardData.gaugeKPIs}
      processedData={processedData}
      ritmoIdeal={dashboardData.ritmoIdeal}
      selectedMonth={selectedMonth}
    />,
  ];

  return (
    <>
      {/* ─── SCALE WRAPPER ─── */}
      <div className="fixed inset-0 overflow-hidden bg-tv-bg">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
          }}
        >
          <TVLayout
            currentScreen={currentScreen}
            totalScreens={4}
            screenDurations={screenDurations}
            timeLeft={timeLeft}
            isRotating={isRotating}
            onToggleRotation={() => setIsRotating(r => !r)}
            onOpenConfig={() => setIsConfigOpen(true)}
            onNavigate={handleNavigate}
            lastUpdate={lastUpdate}
            selectedMonth={selectedMonth}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            isKiosk={isKiosk}
            onKioskExit={resetKioskTimer}
          >
            <div className="h-full w-full overflow-hidden">
              {screens[currentScreen]}
            </div>
          </TVLayout>
        </div>
      </div>

      <TVConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        mensagemDia={mensagemDia}
        setMensagemDia={setMensagemDia}
        kpiPrioridade={kpiPrioridade}
        setKpiPrioridade={setKpiPrioridade}
        isRotating={isRotating}
        setIsRotating={setIsRotating}
        screenDurations={screenDurations}
        setScreenDurations={d => { setScreenDurations(d); setTimeLeft(d[currentScreen]); }}
        gaugeKPIs={dashboardData.gaugeKPIs}
      />
    </>
  );
}

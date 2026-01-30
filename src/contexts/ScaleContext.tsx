import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ScaleFactor = 1 | 1.25 | 1.5 | 1.75 | 2 | "tv55";

interface ScaleContextType {
  scaleFactor: ScaleFactor;
  setScaleFactor: (factor: ScaleFactor) => void;
  isTV: boolean;
  tvScale: number;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

const SCALE_STORAGE_KEY = "dashboard-scale-factor";

// Calcula escala ideal para TV baseado na resolução
const getTVScale = () => {
  const width = window.innerWidth;
  if (width >= 3840) return 2.0;  // 4K
  if (width >= 2560) return 1.75; // QHD
  return 1.5; // FHD ou menor
};

export function ScaleProvider({ children }: { children: ReactNode }) {
  const [scaleFactor, setScaleFactorState] = useState<ScaleFactor>(() => {
    const saved = localStorage.getItem(SCALE_STORAGE_KEY);
    if (saved) {
      if (saved === "tv55") return "tv55";
      const parsed = parseFloat(saved);
      if (parsed === 1 || parsed === 1.25 || parsed === 1.5 || parsed === 1.75 || parsed === 2) {
        return parsed as ScaleFactor;
      }
    }
    return 1;
  });

  const [tvScale, setTvScale] = useState(getTVScale);

  const isTV = scaleFactor === "tv55";

  const setScaleFactor = (factor: ScaleFactor) => {
    setScaleFactorState(factor);
    localStorage.setItem(SCALE_STORAGE_KEY, factor.toString());
    
    // Para modo TV, não mexemos no --scale-factor (será feito via transform)
    if (factor !== "tv55") {
      document.documentElement.style.setProperty("--scale-factor", factor.toString());
    } else {
      // Reset --scale-factor para 1 no modo TV (a escala será via transform)
      document.documentElement.style.setProperty("--scale-factor", "1");
    }
  };

  // Atualiza tvScale quando a janela redimensiona
  useEffect(() => {
    const handleResize = () => {
      setTvScale(getTVScale());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scaleFactor !== "tv55") {
      document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());
    } else {
      document.documentElement.style.setProperty("--scale-factor", "1");
    }
  }, []);

  return (
    <ScaleContext.Provider value={{ scaleFactor, setScaleFactor, isTV, tvScale }}>
      {children}
    </ScaleContext.Provider>
  );
}

export function useScale() {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScale must be used within a ScaleProvider");
  }
  return context;
}

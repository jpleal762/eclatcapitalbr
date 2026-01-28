import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ScaleFactor = 1 | 1.25 | 1.5 | 2;

interface ScaleContextType {
  scaleFactor: ScaleFactor;
  setScaleFactor: (factor: ScaleFactor) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

const SCALE_STORAGE_KEY = "dashboard-scale-factor";

export function ScaleProvider({ children }: { children: ReactNode }) {
  const [scaleFactor, setScaleFactorState] = useState<ScaleFactor>(() => {
    const saved = localStorage.getItem(SCALE_STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (parsed === 1 || parsed === 1.25 || parsed === 1.5 || parsed === 2) {
        return parsed as ScaleFactor;
      }
    }
    return 1;
  });

  const setScaleFactor = (factor: ScaleFactor) => {
    setScaleFactorState(factor);
    localStorage.setItem(SCALE_STORAGE_KEY, factor.toString());
    document.documentElement.style.setProperty("--scale-factor", factor.toString());
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());
  }, []);

  return (
    <ScaleContext.Provider value={{ scaleFactor, setScaleFactor }}>
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

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ScaleFactor = 1 | 1.25 | 1.5 | 1.75 | 2 | "tv55" | "auto";

interface ScaleContextType {
  scaleFactor: ScaleFactor;
  setScaleFactor: (factor: ScaleFactor) => void;
  isTV: boolean;
  tvScale: number;
  effectiveScale: number;
  recalculateAutoScale: () => void;
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

// Calcula escala ideal baseado no viewport
const calculateOptimalScale = (): number => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Dimensões de referência do dashboard (1600x900 - design base)
  const baseWidth = 1600;
  const baseHeight = 900;
  
  // Calcular escala para caber na tela
  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;
  
  // Usar o menor para garantir que caiba em ambas dimensões
  const optimalScale = Math.min(scaleX, scaleY);
  
  // Limitar entre 0.8 e 2.0 para manter legibilidade
  return Math.max(0.8, Math.min(2.0, optimalScale));
};

// Arredonda para o valor válido mais próximo
const roundToValidScale = (scale: number): 1 | 1.25 | 1.5 | 1.75 | 2 => {
  const validScales: (1 | 1.25 | 1.5 | 1.75 | 2)[] = [1, 1.25, 1.5, 1.75, 2];
  let closest = validScales[0];
  let minDiff = Math.abs(scale - closest);
  
  for (const valid of validScales) {
    const diff = Math.abs(scale - valid);
    if (diff < minDiff) {
      minDiff = diff;
      closest = valid;
    }
  }
  
  return closest;
};

export function ScaleProvider({ children }: { children: ReactNode }) {
  const [scaleFactor, setScaleFactorState] = useState<ScaleFactor>(() => {
    const saved = localStorage.getItem(SCALE_STORAGE_KEY);
    if (saved) {
      if (saved === "tv55") return "tv55";
      if (saved === "auto") return "auto";
      const parsed = parseFloat(saved);
      if (parsed === 1 || parsed === 1.25 || parsed === 1.5 || parsed === 1.75 || parsed === 2) {
        return parsed as ScaleFactor;
      }
    }
    // Primeira visita: calcular automaticamente
    return "auto";
  });

  const [tvScale, setTvScale] = useState(getTVScale);
  const [autoScale, setAutoScale] = useState(calculateOptimalScale);

  const isTV = scaleFactor === "tv55";
  const isAuto = scaleFactor === "auto";
  
  // Calcula a escala efetiva que será aplicada
  const effectiveScale = isTV ? tvScale : isAuto ? autoScale : scaleFactor;

  const recalculateAutoScale = () => {
    const newScale = calculateOptimalScale();
    setAutoScale(newScale);
    if (scaleFactor === "auto") {
      document.documentElement.style.setProperty("--scale-factor", newScale.toString());
    }
  };

  const setScaleFactor = (factor: ScaleFactor) => {
    setScaleFactorState(factor);
    localStorage.setItem(SCALE_STORAGE_KEY, factor.toString());
    
    if (factor === "auto") {
      const autoValue = calculateOptimalScale();
      setAutoScale(autoValue);
      document.documentElement.style.setProperty("--scale-factor", autoValue.toString());
    } else if (factor === "tv55") {
      // Reset --scale-factor para 1 no modo TV (a escala será via transform)
      document.documentElement.style.setProperty("--scale-factor", "1");
    } else {
      document.documentElement.style.setProperty("--scale-factor", factor.toString());
    }
  };

  // Atualiza tvScale e autoScale quando a janela redimensiona
  useEffect(() => {
    const handleResize = () => {
      setTvScale(getTVScale());
      const newAutoScale = calculateOptimalScale();
      setAutoScale(newAutoScale);
      // Atualiza CSS se estiver em modo auto
      if (scaleFactor === "auto") {
        document.documentElement.style.setProperty("--scale-factor", newAutoScale.toString());
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scaleFactor]);

  // Aplica escala inicial
  useEffect(() => {
    if (scaleFactor === "auto") {
      document.documentElement.style.setProperty("--scale-factor", autoScale.toString());
    } else if (scaleFactor === "tv55") {
      document.documentElement.style.setProperty("--scale-factor", "1");
    } else {
      document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());
    }
  }, []);

  return (
    <ScaleContext.Provider value={{ scaleFactor, setScaleFactor, isTV, tvScale, effectiveScale, recalculateAutoScale }}>
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

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ICMCard } from "@/components/dashboard/ICMCard";
import { FlipICMCard } from "@/components/dashboard/FlipICMCard";
import { FlipMetaTable } from "@/components/dashboard/FlipMetaTable";
import { AssessorChart } from "@/components/dashboard/AssessorChart";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { FlipGaugeChart } from "@/components/dashboard/FlipGaugeChart";
import { AgendadasCard } from "@/components/dashboard/AgendadasCard";
import { YearlyICMCard } from "@/components/dashboard/YearlyICMCard";
import { YearlyMetaTable } from "@/components/dashboard/YearlyMetaTable";
import { YearlyAssessorChart } from "@/components/dashboard/YearlyAssessorChart";
import { YearlyGaugeChart } from "@/components/dashboard/YearlyGaugeChart";
import { YearlyAnalysisCard } from "@/components/dashboard/YearlyAnalysisCard";
import { DashboardSidebar, DashboardVisibility, defaultVisibility } from "@/components/dashboard/DashboardSidebar";
import { ExpandableCard } from "@/components/dashboard/ExpandableCard";
// AssessorSelector removed - direct access to dashboard
import { KPIRecord, DashboardFilters, YearlyDashboardFilters, SPRINT_PRODUCTS } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  getAvailableMonths,
  processDashboardData,
  calculateAssessorRemainingForKPI,
  calculateAssessorAgendadasForKPI,
  calculateAssessorReceitaEmpilhada,
  getWeightForLabel,
  calculateSprintData,
  getAssessorHistoricalICMFromCurrent,
} from "@/lib/kpiUtils";
import { 
  processYearlyDashboardData, 
  getAvailableYears 
} from "@/lib/yearlyKpiUtils";
import { loadExcelData, saveExcelData, getLastUpdateTimestamp } from "@/lib/storage";
import { getOpenMonth, updateLastProductionUpdate } from "@/lib/permissions";
import { 
  saveSprintSnapshot, 
  getLatestSnapshot, 
  calculateEvolution, 
  calculateEvolution48h 
} from "@/lib/sprintStorage";
import { SprintEvolution, SprintEvolution48h } from "@/types/kpi";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import eclatLogo from "@/assets/eclat-xp-logo.png";
import eclatLogoDark from "@/assets/eclat-xp-logo-dark.svg";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

import { ScaleSelector } from "@/components/ScaleSelector";
import { useScale } from "@/contexts/ScaleContext";
import { Card } from "@/components/ui/card";
import { PageToggle, PageType } from "@/components/dashboard/PageToggle";
import { AnalysisPage } from "@/components/dashboard/AnalysisPage";
import { SprintPage } from "@/components/dashboard/SprintPage";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { TokenAccessConfig } from "@/components/dashboard/TokenAccessConfig";
import { ProductionEditModal } from "@/components/dashboard/ProductionEditModal";
import { exportDatabaseToXLSX } from "@/lib/exportUtils";

const VISIBILITY_STORAGE_KEY = "dashboard-visibility";
const SPRINT_PRODUCTS_STORAGE_KEY = "sprint-selected-products";
const ECLAT_PWA_TOKEN_KEY = "eclat:pwa:token";

// Helper para detectar modo standalone (PWA instalado)
const isStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Função para obter o mês atual no formato "jan-26"
const getCurrentMonthValue = () => {
  const now = new Date();
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${monthNames[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
};

const Index = () => {
  const { resolvedTheme } = useTheme();
  const { isTV, tvScale } = useScale();
  const [searchParams] = useSearchParams();
  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isTokenValidating, setIsTokenValidating] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    assessor: "all",
    month: getCurrentMonthValue(), // Mês atual como padrão
  });
  const [yearlyFilters, setYearlyFilters] = useState<YearlyDashboardFilters>({
    assessor: "all",
    year: new Date().getFullYear(),
  });
  const [visibility, setVisibility] = useState<DashboardVisibility>(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultVisibility;
      }
    }
    return defaultVisibility;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [isGlobalFlipped, setIsGlobalFlipped] = useState(false);
  const [isPageRotationEnabled, setIsPageRotationEnabled] = useState(false);
  const [isCardFlippingEnabled, setIsCardFlippingEnabled] = useState(false);
  const [allowedScreens, setAllowedScreens] = useState<PageType[]>(['dashboard', 'analysis', 'sprint']);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProductionEditOpen, setIsProductionEditOpen] = useState(false);
  const [productionEditCategory, setProductionEditCategory] = useState<string | string[] | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [tokenRole, setTokenRole] = useState<string | null>(null);
  const [tokenAssessorName, setTokenAssessorName] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const [lastProductionUpdate, setLastProductionUpdate] = useState<string | null>(null);
  const [isProductionEditEnabled, setIsProductionEditEnabled] = useState(true);
  
  // Sprint product selection state with localStorage persistence
  const [selectedSprintProducts, setSelectedSprintProducts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(SPRINT_PRODUCTS_STORAGE_KEY);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set(SPRINT_PRODUCTS.map(p => p.category));
      }
    }
    return new Set(SPRINT_PRODUCTS.map(p => p.category));
  });
  
  // Sprint evolution state
  const [evolutionMap, setEvolutionMap] = useState<Map<string, SprintEvolution> | undefined>(undefined);
  const [evolution48h, setEvolution48h] = useState<SprintEvolution48h | null>(null);
  
  
  // Estado para controle da visão
  // null = Escritório (filtros livres) - padrão
  // "Nome Assessor" = assessor específico (filtro bloqueado via token)
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [isTokenLocked, setIsTokenLocked] = useState(false); // Token via URL bloqueia permanentemente
  const isViewLocked = isTokenLocked; // Só bloqueia quando acesso via token

  // Validação de token via URL ou localStorage (para PWA instalado)
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const storedToken = localStorage.getItem(ECLAT_PWA_TOKEN_KEY);
    
    // Se já validou, não faz nada
    if (tokenValidated) return;
    
    // Determina qual token usar: URL tem prioridade, senão usa localStorage (se em standalone)
    const tokenToValidate = urlToken || (isStandaloneMode() ? storedToken : null);
    
    if (!tokenToValidate) return;

    const validateToken = async () => {
      setIsTokenValidating(true);
      setTokenError(null);
      
      try {
        const { data, error } = await supabase
          .from("assessor_tokens")
          .select("id, assessor_name, is_active, allowed_screens, role, last_production_update_at")
          .eq("token", tokenToValidate)
          .maybeSingle();

        if (error) {
          console.error("Erro ao validar token:", error);
          // Se era token salvo e falhou, limpa do localStorage
          if (!urlToken && storedToken) {
            localStorage.removeItem(ECLAT_PWA_TOKEN_KEY);
          }
          setTokenError("Erro ao validar acesso. Tente novamente.");
          return;
        }

        if (!data) {
          // Token inválido - se era salvo, remove do localStorage
          if (!urlToken && storedToken) {
            localStorage.removeItem(ECLAT_PWA_TOKEN_KEY);
          }
          setTokenError("Token inválido. Verifique o link de acesso.");
          return;
        }

        if (!data.is_active) {
          // Token desativado - se era salvo, remove do localStorage
          if (!urlToken && storedToken) {
            localStorage.removeItem(ECLAT_PWA_TOKEN_KEY);
          }
          setTokenError("Este link de acesso foi desativado.");
          return;
        }

        // Token válido - salva no localStorage para PWA
        localStorage.setItem(ECLAT_PWA_TOKEN_KEY, tokenToValidate);
        
        // Bloqueia visão para este assessor
        setSelectedView(data.assessor_name);
        setFilters(prev => ({ ...prev, assessor: data.assessor_name }));
        setIsTokenLocked(true);
        setTokenValidated(true);
        
        // Store role and token info
        setTokenRole((data as any).role || 'socio');
        setTokenAssessorName(data.assessor_name);
        setTokenId(data.id);
        setLastProductionUpdate((data as any).last_production_update_at || null);
        
        // Configura telas permitidas
        const rawScreens = (data.allowed_screens as string[]) || ['dashboard', 'analysis', 'sprint'];
        const screens = rawScreens.filter((s): s is PageType => ['dashboard', 'analysis', 'sprint'].includes(s));
        setAllowedScreens(screens);
        // Se a página atual não é permitida, muda para a primeira permitida
        if (!screens.includes(currentPage)) {
          setCurrentPage(screens[0] || 'dashboard');
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        // Se era token salvo e falhou, limpa do localStorage
        if (!urlToken && storedToken) {
          localStorage.removeItem(ECLAT_PWA_TOKEN_KEY);
        }
        setTokenError("Erro inesperado. Tente novamente.");
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [searchParams, tokenValidated]);

  // Fullscreen toggle with F11
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(prev => {
          const newState = !prev;
          if (newState) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
          return newState;
        });
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Save visibility to localStorage
  useEffect(() => {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  // Save sprint products selection to localStorage
  useEffect(() => {
    localStorage.setItem(SPRINT_PRODUCTS_STORAGE_KEY, JSON.stringify([...selectedSprintProducts]));
  }, [selectedSprintProducts]);

  const handleVisibilityChange = (key: keyof DashboardVisibility, value: boolean) => {
    setVisibility(prev => ({ ...prev, [key]: value }));
  };

  // Handlers de seleção de visão removidos - acesso direto ao dashboard

  // Load data from storage and open month on mount
  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true);
      try {
        const [storedData, timestamp, month] = await Promise.all([
          loadExcelData(),
          getLastUpdateTimestamp(),
          getOpenMonth(),
        ]);
        if (storedData && storedData.length > 0) {
          setRawData(storedData);
        }
        setLastUpdateTime(timestamp);
        setOpenMonth(month);
      } catch (error) {
        console.error("Error loading stored data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  // Handle data loaded from file upload
  const handleDataLoaded = async (data: KPIRecord[]) => {
    const auditName = tokenAssessorName || "Escritório";
    setRawData(data);
    await saveExcelData(data, { createdBy: auditName, updatedBy: auditName });
    
    // Update last update timestamp
    setLastUpdateTime(new Date().toISOString());
    
    // Update last production update for token user
    if (tokenId) {
      await updateLastProductionUpdate(tokenId);
      setLastProductionUpdate(new Date().toISOString());
    }
    
    // Save sprint snapshot for evolution tracking
    const currentMonth = getCurrentMonthValue();
    const currentSprintData = calculateSprintData(processKPIData(data), currentMonth, "all");
    await saveSprintSnapshot(currentMonth, currentSprintData);
    
    // Load evolution from previous snapshot
    await loadEvolutionData(currentMonth, currentSprintData);
  };

  // Load evolution data from previous snapshot
  const loadEvolutionData = async (month: string, currentSprintData: ReturnType<typeof calculateSprintData>) => {
    try {
      const previousSnapshot = await getLatestSnapshot(month, 24);
      if (previousSnapshot) {
        const evoMap = calculateEvolution(currentSprintData, previousSnapshot);
        setEvolutionMap(evoMap);
        
        const evo48h = calculateEvolution48h(currentSprintData, previousSnapshot);
        setEvolution48h(evo48h);
      } else {
        setEvolutionMap(undefined);
        setEvolution48h(null);
      }
    } catch (err) {
      console.error("Error loading evolution data:", err);
    }
  };

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);

  // Helper to open production edit modal for a specific category
  const handleEditProductionForKPI = (category: string | string[]) => {
    if (!isProductionEditEnabled) return;
    setProductionEditCategory(category);
    setIsProductionEditOpen(true);
  };

  // Mapeamento dos índices de gaugeKPIs para as categorias do banco
  const GAUGE_CATEGORY_MAP: Record<number, string | string[]> = {
    0: "Captação net",
    1: "Receita",
    2: "Primeira reuniao",
    3: "Diversificada ( ROA>1,5)",
    4: "Parceiros Tri",
    5: "PJ1 XP",
    6: ["PJ2 XP", "Receita Empilhada"],
    7: "Habilitacao",
    8: "Ativacao",
  };
  
  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const months = useMemo(() => getAvailableMonths(processedData), [processedData]);
  const availableYears = useMemo(() => {
    const years = getAvailableYears(processedData);
    console.log("DEBUG - Anos extraídos:", years);
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [processedData]);

  // Sincronizar mês selecionado com meses disponíveis ao carregar dados
  useEffect(() => {
    if (months.length > 0) {
      const currentMonthValue = getCurrentMonthValue();
      
      // Normaliza para comparação (remove separadores e converte para minúsculo)
      const normalizeMonth = (m: string) => m.toLowerCase().replace(/[\/\-]/g, '');
      const currentNormalized = normalizeMonth(currentMonthValue);
      
      // Busca do mês atual nos dados (case-insensitive e separator-agnostic)
      const exactMatch = months.find(m => normalizeMonth(m) === currentNormalized);
      
      if (exactMatch) {
        // Se o mês atual existe nos dados, seleciona ele
        setFilters(prev => ({ ...prev, month: exactMatch }));
      } else if (!months.includes(filters.month)) {
        // Se o mês atual não existe E o mês selecionado também não existe,
        // seleciona o mês mais recente (último da lista)
        setFilters(prev => ({ ...prev, month: months[months.length - 1] }));
      }
    }
  }, [months]);

  // Load evolution data when sprint data changes (e.g., on initial load)
  useEffect(() => {
    if (sprintData.length > 0 && filters.month) {
      loadEvolutionData(filters.month, sprintData);
    }
  }, [filters.month]);

  const dashboardData = useMemo(
    () => processDashboardData(processedData, filters.month, filters.assessor),
    [processedData, filters.month, filters.assessor]
  );

  // Calculate assessor historical ICM based on CURRENT month (not selected month)
  const assessorHistoricalICM = useMemo(
    () => getAssessorHistoricalICMFromCurrent(processedData, filters.assessor, months, 2),
    [processedData, filters.assessor, months]
  );

  const yearlyDashboardData = useMemo(
    () => processYearlyDashboardData(processedData, yearlyFilters.year, yearlyFilters.assessor),
    [processedData, yearlyFilters.year, yearlyFilters.assessor]
  );

  // Calculate sprint data
  const sprintData = useMemo(
    () => calculateSprintData(processedData, filters.month, filters.assessor),
    [processedData, filters.month, filters.assessor]
  );

  // Filter sprint data by selected products
  const filteredSprintData = useMemo(
    () => sprintData.filter(kpi => selectedSprintProducts.has(kpi.category)),
    [sprintData, selectedSprintProducts]
  );

  // Calculate assessor remaining data for TV mode (graphs 1 and 2)
  const assessorRemainingCaptacao = useMemo(
    () => calculateAssessorRemainingForKPI(processedData, "Captação net", filters.month),
    [processedData, filters.month]
  );

  // assessorRemainingReceita now for PJ1 XP (main position)
  const assessorRemainingReceita = useMemo(
    () => calculateAssessorRemainingForKPI(
      processedData, 
      "PJ1 XP Mês", 
      filters.month, 
      undefined,        // Target from same category
      "PJ1 XP",         // actualCategory
    ),
    [processedData, filters.month]
  );

  // Calculate assessor agendadas data for TV mode (graph 3)
  const assessorAgendadas = useMemo(
    () => calculateAssessorAgendadasForKPI(processedData, filters.month),
    [processedData, filters.month]
  );

  // Calculate receita empilhada data for graph 7 flip card
  const assessorReceitaEmpilhada = useMemo(
    () => calculateAssessorReceitaEmpilhada(processedData, filters.month),
    [processedData, filters.month]
  );

  // Calculate assessor remaining data for Receita Parceiros (Graph 5)
  const assessorRemainingParceiros = useMemo(
    () => calculateAssessorRemainingForKPI(processedData, "Parceiros Tri", filters.month),
    [processedData, filters.month]
  );

  // Calculate assessor remaining data for Diversificação
  const assessorRemainingDiversificacao = useMemo(
    () => calculateAssessorRemainingForKPI(processedData, "Diversificada ( ROA>1,5)", filters.month),
    [processedData, filters.month]
  );


  // Debug: Log completo para diagnóstico
  useEffect(() => {
    if (processedData.length > 0) {
      const allMonths = new Set<string>();
      processedData.forEach(r => r.monthlyData.forEach(m => allMonths.add(m.month)));
      console.log("=== DEBUG COMPLETO ===");
      console.log("Total de registros processados:", processedData.length);
      console.log("Meses únicos encontrados:", Array.from(allMonths));
      console.log("Anos disponíveis (filtro):", availableYears);
      console.log("Filtro anual atual:", yearlyFilters);
      console.log("yearlyDashboardData.gaugeKPIs:", yearlyDashboardData.gaugeKPIs?.map(k => ({ label: k.label, value: k.value, target: k.target })));
      console.log("======================");
    }
  }, [processedData, availableYears, yearlyFilters, yearlyDashboardData]);

  const hasData = rawData.length > 0;

  // Auto-rotate between allowed pages every 90 seconds
  useEffect(() => {
    if (!hasData || !isPageRotationEnabled) return;
    
    // Filter rotation pages based on allowed screens
    const rotationPages: PageType[] = ["dashboard", "analysis"];
    const pageOrder = rotationPages.filter(page => allowedScreens.includes(page));
    
    if (pageOrder.length <= 1) return; // No rotation if only one page allowed
    
    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const currentIndex = pageOrder.indexOf(prev);
        const nextIndex = (currentIndex + 1) % pageOrder.length;
        return pageOrder[nextIndex];
      });
    }, 90000); // 1 minuto e 30 segundos
    
    return () => clearInterval(interval);
  }, [hasData, isPageRotationEnabled, allowedScreens]);

  // Global flip state - toggles every 30 seconds to sync all flip cards
  useEffect(() => {
    if (!hasData || !isCardFlippingEnabled) return;
    
    const interval = setInterval(() => {
      setIsGlobalFlipped(prev => !prev);
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [hasData, isCardFlippingEnabled]);

  // Calculate grid columns based on visible top cards
  const visibleTopCards = [visibility.card1, visibility.card2, visibility.card3].filter(Boolean).length;
  const topGridCols = visibleTopCards === 3 ? "lg:grid-cols-3" : 
                      visibleTopCards === 2 ? "lg:grid-cols-2" : 
                      visibleTopCards === 1 ? "lg:grid-cols-1" : "";

  // Calculate grid columns for gauge sections
  const getVisibleGaugeColumns = () => {
    const col1Visible = visibility.graph1 || visibility.graph4 || visibility.graph5;
    const col2Visible = visibility.graph2 || visibility.graph6 || visibility.graph7;
    const col3Visible = visibility.graph3 || visibility.graph8 || visibility.graph9;
    const visibleCols = [col1Visible, col2Visible, col3Visible].filter(Boolean).length;
    return visibleCols === 3 ? "lg:grid-cols-3" : 
           visibleCols === 2 ? "lg:grid-cols-2" : 
           visibleCols === 1 ? "lg:grid-cols-1" : "";
  };

  const gaugeGridCols = getVisibleGaugeColumns();
  const col1Visible = visibility.graph1 || visibility.graph4 || visibility.graph5;
  const col2Visible = visibility.graph2 || visibility.graph6 || visibility.graph7;
  const col3Visible = visibility.graph3 || visibility.graph8 || visibility.graph9;

  // Tela de erro para token inválido
  if (tokenError) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="mb-6">
            <img 
              src={resolvedTheme === 'dark' ? eclatLogoDark : eclatLogo} 
              alt="Éclat XP Logo" 
              className="h-12 mx-auto object-contain"
            />
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-destructive mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">{tokenError}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = window.location.origin}
          >
            Ir para página inicial
          </Button>
        </div>
      </div>
    );
  }

  // Tela de loading para validação de token
  if (isTokenValidating) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validando acesso...</p>
        </div>
      </div>
    );
  }

  // Tela de seleção removida - acesso direto ao dashboard

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen bg-background flex w-full overflow-hidden">
        {!isFullscreen && (
          <DashboardSidebar 
            visibility={visibility} 
            onVisibilityChange={handleVisibilityChange} 
          />
        )}
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header - always visible */}
          <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="w-40 flex items-center gap-2">
                  {!isFullscreen && (
                    <SidebarTrigger className="p-2 hover:bg-muted rounded-md">
                      <Menu className="h-5 w-5" />
                    </SidebarTrigger>
                  )}
                  {/* Badge indicando sessão bloqueada via token */}
                  {isTokenLocked && selectedView && (
                    <div className="flex flex-col">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        🔒 {selectedView.split(' ')[0]}
                      </span>
                      {lastProductionUpdate && (
                        <span className="text-[8px] text-muted-foreground mt-0.5 text-center">
                          Atualizado: {new Date(lastProductionUpdate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <img 
                    src={resolvedTheme === 'dark' ? eclatLogoDark : eclatLogo} 
                    alt="Éclat XP Logo" 
                    className="h-8 object-contain"
                  />
                </div>
                <div className="w-48 flex justify-end items-center gap-2">
                  {/* Page Toggle Button */}
                  {hasData && (
                    <PageToggle 
                      currentPage={currentPage} 
                      onPageChange={setCurrentPage}
                      allowedScreens={allowedScreens}
                    />
                  )}
                  {/* Config Button - only visible when not in token mode */}
                  {hasData && !isTokenLocked && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsConfigOpen(true)}
                            className="h-8 w-8"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Configurações
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <ScaleSelector />
                  {/* File Upload - only visible when not in token mode */}
                  {hasData && !isTokenLocked && (
                    <FileUpload onDataLoaded={handleDataLoaded} compact lastUpdate={lastUpdateTime} role={tokenRole} assessorName={tokenAssessorName} openMonth={openMonth} />
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className={cn(
            "flex-1 overflow-hidden",
            viewMode === 'mobile' && "flex justify-center"
          )}>
            <div 
              className={cn(
                "h-full w-full px-4 py-3",
                viewMode === 'mobile' && "mobile-view-container max-w-[390px] overflow-y-auto"
              )}
              style={isTV ? {
                transform: `scale(${tvScale})`,
                transformOrigin: "top left",
                width: `${100 / tvScale}%`,
                height: `${100 / tvScale}%`,
              } : undefined}
            >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              </div>
            ) : !hasData ? (
              <div className="mx-auto max-w-xl animate-fade-in pt-12">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2 text-foreground">Bem-vindo ao Dashboard</h2>
                  <p className="text-muted-foreground">
                    Carregue seus dados KPI em formato XLSX ou JSON para visualizar as métricas de performance
                  </p>
                </div>
                <FileUpload onDataLoaded={handleDataLoaded} />
              </div>
            ) : currentPage === "analysis" ? (
              // ANALYSIS PAGE
              <AnalysisPage 
                processedData={processedData}
                assessors={assessors}
                availableYears={availableYears}
                selectedAssessor={filters.assessor}
                onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
                isAssessorLocked={isViewLocked}
              />
            ) : currentPage === "sprint" ? (
              // SPRINT PAGE
              <SprintPage
                sprintData={filteredSprintData}
                assessors={assessors}
                months={months}
                selectedAssessor={filters.assessor}
                selectedMonth={filters.month}
                onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
                onMonthChange={(value) => setFilters({ ...filters, month: value })}
                isLocked={isViewLocked}
                evolutionMap={evolutionMap}
                selectedProducts={selectedSprintProducts}
                onProductToggle={(category) => {
                  setSelectedSprintProducts(prev => {
                    const next = new Set(prev);
                    if (next.has(category)) {
                      next.delete(category);
                    } else {
                      next.add(category);
                    }
                    return next;
                  });
                }}
              />
            ) : (
              // MONTHLY VIEW
              <div className="h-full flex flex-col gap-3 animate-fade-in lg:overflow-hidden">
                {/* Top Row - ICM with Filters, Meta, Assessor Ranking */}
                {visibleTopCards > 0 && (
                  <div className={`grid gap-3 flex-[45] min-h-0 lg:overflow-hidden ${topGridCols}`}>
                    {visibility.card1 && (
                      <div className="h-full overflow-hidden">
                        <ExpandableCard>
                        <FlipICMCard
                            icmGeral={dashboardData.icmGeral}
                            ritmoIdeal={dashboardData.ritmoIdeal}
                            diasUteisRestantes={dashboardData.diasUteisRestantes}
                            assessors={assessors}
                            selectedAssessor={filters.assessor}
                            selectedMonth={filters.month}
                            months={months}
                            onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
                            onMonthChange={(value) => setFilters({ ...filters, month: value })}
                            dashboardData={dashboardData}
                            isFlipped={isGlobalFlipped}
                            isLocked={isViewLocked}
                            historicalData={assessorHistoricalICM}
                          />
                        </ExpandableCard>
                      </div>
                    )}
                    {visibility.card2 && (
                      <ExpandableCard>
                        <FlipMetaTable
                          data={dashboardData.metaSemanal}
                          realPercentage={dashboardData.metaSemanalReal}
                          selectedAssessor={filters.assessor}
                          weekToMonthPercentage={dashboardData.metaSemanalPercentage}
                          isFlipped={isGlobalFlipped}
                        />
                      </ExpandableCard>
                    )}
                    {visibility.card3 && (
                      <ExpandableCard>
                        <div 
                          className="relative h-full cursor-pointer perspective-1000"
                          onClick={() => {}}
                        >
                          <div 
                            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                              isGlobalFlipped ? 'rotate-y-180' : ''
                            }`}
                          >
                            {/* Frente - Gauge Primeiras Reuniões */}
                            <div className="absolute inset-0 backface-hidden overflow-hidden flex items-start justify-center">
                              <div className="relative h-full w-full">
                                <GaugeChart
                                  label={dashboardData.gaugeKPIs[2]?.label || "Primeiras Reuniões"}
                                  value={dashboardData.gaugeKPIs[2]?.value || 0}
                                  target={dashboardData.gaugeKPIs[2]?.target || 0}
                                  percentage={dashboardData.gaugeKPIs[2]?.percentage || 0}
                                  isCurrency={dashboardData.gaugeKPIs[2]?.isCurrency}
                                  warning={dashboardData.gaugeKPIs[2]?.warning}
                                  size="lg"
                                  showRemaining={true}
                                  ritmoIdeal={dashboardData.ritmoIdeal}
                                  weight={getWeightForLabel(dashboardData.gaugeKPIs[2]?.label || "")}
                                  compact={false}
                                  onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[2])}
                                />
                              </div>
                            </div>
                            {/* Verso - AgendadasCard */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden">
                              <AgendadasCard
                                agendadasValue={dashboardData.gaugeKPIs[2]?.secondaryValue || 0}
                                assessorData={assessorAgendadas}
                              />
                            </div>
                          </div>
                        </div>
                      </ExpandableCard>
                    )}
                  </div>
                )}

                {/* KPI Gauges - Main graphs with sub-graphs */}
                {(col1Visible || col2Visible || col3Visible) && (
                  <div className={`grid gap-3 flex-[55] min-h-0 lg:overflow-hidden ${gaugeGridCols}`}>
                    {/* Column 1: Graph 1 + Sub-graphs 4, 5 */}
                    {col1Visible && (
                      <div className="flex flex-col gap-2 min-h-0 h-full overflow-hidden">
                        {visibility.graph1 && (
                          <div className="flex-[65] min-h-0 overflow-hidden">
                          <ExpandableCard>
                            <AssessorChart
                              data={dashboardData.assessorPerformance} 
                              ritmoIdeal={dashboardData.ritmoIdeal}
                              selectedAssessor={filters.assessor}
                              agendadasData={assessorAgendadas}
                            />
                          </ExpandableCard>
                          </div>
                        )}
                        {(visibility.graph4 || visibility.graph5) && (
                          <div className="flex-[35] min-h-0 overflow-hidden">
                            <div className="grid grid-cols-2 gap-2 h-full">
                        {visibility.graph4 && (
                              <ExpandableCard>
                                <GaugeChart
                                  label={dashboardData.gaugeKPIs[7]?.label}
                                  value={dashboardData.gaugeKPIs[7]?.value}
                                  target={dashboardData.gaugeKPIs[7]?.target}
                                  percentage={dashboardData.gaugeKPIs[7]?.percentage}
                                  isCurrency={dashboardData.gaugeKPIs[7]?.isCurrency}
                                  warning={dashboardData.gaugeKPIs[7]?.warning}
                                  size="sm"
                                  showRemaining={true}
                                  ritmoIdeal={dashboardData.ritmoIdeal}
                                  weight={getWeightForLabel(dashboardData.gaugeKPIs[7]?.label)}
                                  compact={true}
                                  onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[7])}
                                />
                              </ExpandableCard>
                            )}
                            {visibility.graph5 && (
                              <ExpandableCard>
                                <GaugeChart
                                  label={dashboardData.gaugeKPIs[8]?.label}
                                  value={dashboardData.gaugeKPIs[8]?.value}
                                  target={dashboardData.gaugeKPIs[8]?.target}
                                  percentage={dashboardData.gaugeKPIs[8]?.percentage}
                                  isCurrency={dashboardData.gaugeKPIs[8]?.isCurrency}
                                  warning={dashboardData.gaugeKPIs[8]?.warning}
                                  size="sm"
                                  showRemaining={true}
                                  ritmoIdeal={dashboardData.ritmoIdeal}
                                  weight={getWeightForLabel(dashboardData.gaugeKPIs[8]?.label)}
                                  compact={true}
                                  onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[8])}
                                />
                              </ExpandableCard>
                            )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 2: Graph 2 + Sub-graphs 6, 7 */}
                    {col2Visible && (
                      <div className="flex flex-col gap-2 min-h-0 h-full overflow-hidden">
                        {visibility.graph2 && (
                          <div className="flex-[65] min-h-0 overflow-hidden">
                          <ExpandableCard>
                            <GaugeChart
                              label={dashboardData.gaugeKPIs[5]?.label}
                              value={dashboardData.gaugeKPIs[5]?.value}
                              target={dashboardData.gaugeKPIs[5]?.target}
                              percentage={dashboardData.gaugeKPIs[5]?.percentage}
                              isCurrency={dashboardData.gaugeKPIs[5]?.isCurrency}
                              warning={dashboardData.gaugeKPIs[5]?.warning}
                              size="lg"
                              showRemaining={true}
                              ritmoIdeal={dashboardData.ritmoIdeal}
                              showAssessorList={true}
                              assessorRemainingData={assessorRemainingReceita}
                              headName="BRUNO"
                              compact={true}
                              onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[5])}
                            />
                          </ExpandableCard>
                          </div>
                        )}
                        {(visibility.graph6 || visibility.graph7) && (
                          <div className="flex-[35] min-h-0 overflow-hidden">
                            <div className="grid grid-cols-2 gap-2 h-full">
                            {visibility.graph6 && (
                              <ExpandableCard>
                                <FlipGaugeChart
                                  label={dashboardData.gaugeKPIs[6]?.label}
                                  value={dashboardData.gaugeKPIs[6]?.value}
                                  target={dashboardData.gaugeKPIs[6]?.target}
                                  percentage={dashboardData.gaugeKPIs[6]?.percentage}
                                  isCurrency={dashboardData.gaugeKPIs[6]?.isCurrency}
                                  warning={dashboardData.gaugeKPIs[6]?.warning}
                                  size="sm"
                                  showRemaining={true}
                                  ritmoIdeal={dashboardData.ritmoIdeal}
                                  additionalValue={dashboardData.gaugeKPIs[6]?.additionalValue}
                                  backTitle="Receita Empilhada"
                                  backData={assessorReceitaEmpilhada}
                                  isFlipped={isGlobalFlipped}
                                  compact={true}
                                  onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[6])}
                                />
                              </ExpandableCard>
                            )}
                            {visibility.graph7 && (
                              <ExpandableCard>
                                <FlipGaugeChart
                                  label={dashboardData.gaugeKPIs[4]?.label}
                                  value={dashboardData.gaugeKPIs[4]?.value}
                                  target={dashboardData.gaugeKPIs[4]?.target}
                                  percentage={dashboardData.gaugeKPIs[4]?.percentage}
                                  isCurrency={dashboardData.gaugeKPIs[4]?.isCurrency}
                                  warning={dashboardData.gaugeKPIs[4]?.warning}
                                  size="sm"
                                  showRemaining={true}
                                  ritmoIdeal={dashboardData.ritmoIdeal}
                                  backTitle="Falta por Assessor"
                                  backData={assessorRemainingParceiros
                                    .filter(a => !a.achieved)
                                    .map(a => ({ name: a.name, value: a.remaining }))}
                                  isFlipped={isGlobalFlipped}
                                  weight={getWeightForLabel(dashboardData.gaugeKPIs[4]?.label)}
                                  compact={true}
                                  onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[4])}
                                />
                              </ExpandableCard>
                            )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 3: Graph 3 + Sub-graphs 8, 9 */}
                    {col3Visible && (
                      <div className="flex flex-col gap-2 min-h-0 h-full overflow-hidden">
                        {visibility.graph3 && (
                          <div className="flex-[65] min-h-0 overflow-hidden">
                          <ExpandableCard>
                            <GaugeChart
                              label={dashboardData.gaugeKPIs[0]?.label}
                              value={dashboardData.gaugeKPIs[0]?.value}
                              target={dashboardData.gaugeKPIs[0]?.target}
                              percentage={dashboardData.gaugeKPIs[0]?.percentage}
                              isCurrency={dashboardData.gaugeKPIs[0]?.isCurrency}
                              warning={dashboardData.gaugeKPIs[0]?.warning}
                              size="lg"
                              showRemaining={true}
                              ritmoIdeal={dashboardData.ritmoIdeal}
                              showAssessorList={true}
                              assessorRemainingData={assessorRemainingCaptacao}
                               weight={getWeightForLabel(dashboardData.gaugeKPIs[0]?.label)}
                              compact={true}
                              onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[0])}
                            />
                          </ExpandableCard>
                          </div>
                        )}
                        {(visibility.graph8 || visibility.graph9) && (
                          <div className="flex-[35] min-h-0 overflow-hidden">
                            <ExpandableCard>
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[3]?.label}
                                value={dashboardData.gaugeKPIs[3]?.value}
                                target={dashboardData.gaugeKPIs[3]?.target}
                                percentage={dashboardData.gaugeKPIs[3]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[3]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[3]?.warning}
                                size="lg"
                                showRemaining={true}
                                ritmoIdeal={dashboardData.ritmoIdeal}
                                weight={getWeightForLabel(dashboardData.gaugeKPIs[3]?.label)}
                                compact={true}
                                showAssessorList={true}
                                assessorRemainingData={assessorRemainingDiversificacao}
                                headName="BRUNO"
                                onEditProduction={() => handleEditProductionForKPI(GAUGE_CATEGORY_MAP[3])}
                              />
                            </ExpandableCard>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </main>
        </div>
        
        {/* PWA Install Prompt - só aparece após token validado (quando há token na URL) */}
        <PWAInstallPrompt 
          assessorName={isTokenLocked ? selectedView : null} 
          enabled={!searchParams.get("token") || tokenValidated}
        />
        
        {/* Token Access Configuration Modal */}
        <TokenAccessConfig 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)}
          isPageRotationEnabled={isPageRotationEnabled}
          onPageRotationChange={setIsPageRotationEnabled}
          isCardFlippingEnabled={isCardFlippingEnabled}
          onCardFlippingChange={setIsCardFlippingEnabled}
          isFullscreen={isFullscreen}
          onFullscreenChange={setIsFullscreen}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          openMonth={openMonth}
          onOpenMonthChange={setOpenMonth}
          onEditProduction={() => { setIsConfigOpen(false); setIsProductionEditOpen(true); }}
          onExportDatabase={() => { setIsConfigOpen(false); exportDatabaseToXLSX(); }}
          isProductionEditEnabled={isProductionEditEnabled}
          onProductionEditEnabledChange={setIsProductionEditEnabled}
        />

        {/* Production Edit Modal */}
        <ProductionEditModal
          isOpen={isProductionEditOpen}
          onClose={() => { setIsProductionEditOpen(false); setProductionEditCategory(null); }}
          role={isTokenLocked ? tokenRole : 'admin'}
          assessorName={tokenAssessorName}
          openMonth={openMonth}
          tokenId={tokenId}
          filterCategory={productionEditCategory}
          onDataUpdated={async () => {
            const data = await loadExcelData();
            if (data) setRawData(data);
            setLastUpdateTime(new Date().toISOString());
            if (tokenId) setLastProductionUpdate(new Date().toISOString());
          }}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;

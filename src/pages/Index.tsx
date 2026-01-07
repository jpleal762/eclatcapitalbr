import { useState, useMemo, useEffect } from "react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ICMCard } from "@/components/dashboard/ICMCard";
import { MetaTable } from "@/components/dashboard/MetaTable";
import { AssessorChart } from "@/components/dashboard/AssessorChart";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { YearlyICMCard } from "@/components/dashboard/YearlyICMCard";
import { YearlyMetaTable } from "@/components/dashboard/YearlyMetaTable";
import { YearlyAssessorChart } from "@/components/dashboard/YearlyAssessorChart";
import { YearlyGaugeChart } from "@/components/dashboard/YearlyGaugeChart";
import { YearlyAnalysisCard } from "@/components/dashboard/YearlyAnalysisCard";
import { DashboardSidebar, DashboardVisibility, defaultVisibility } from "@/components/dashboard/DashboardSidebar";
import { KPIRecord, DashboardFilters, DashboardView, YearlyDashboardFilters } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  getAvailableMonths,
  processDashboardData,
  calculateAssessorRemainingForKPI,
  calculateAssessorAgendadasForKPI,
} from "@/lib/kpiUtils";
import { AssessorRemainingMatrix } from "@/components/dashboard/AssessorRemainingMatrix";
import { AssessorAgendadasMatrix } from "@/components/dashboard/AssessorAgendadasMatrix";
import { 
  processYearlyDashboardData, 
  getAvailableYears 
} from "@/lib/yearlyKpiUtils";
import { loadExcelData, saveExcelData } from "@/lib/storage";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import eclatLogo from "@/assets/eclat-xp-logo.png";
import { useAutoTheme } from "@/hooks/use-auto-theme";
import { ThemeToggle } from "@/components/ThemeToggle";

const VISIBILITY_STORAGE_KEY = "dashboard-visibility";

// Função para obter o mês atual no formato "jan/26"
const getCurrentMonthValue = () => {
  const now = new Date();
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${monthNames[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
};

const Index = () => {
  // Hook para tema automático (dark após 16:00)
  useAutoTheme();

  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>("monthly");
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

  // Save visibility to localStorage
  useEffect(() => {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const handleVisibilityChange = (key: keyof DashboardVisibility, value: boolean) => {
    setVisibility(prev => ({ ...prev, [key]: value }));
  };

  // Load data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true);
      try {
        const storedData = await loadExcelData();
        if (storedData && storedData.length > 0) {
          setRawData(storedData);
        }
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
    setRawData(data);
    await saveExcelData(data);
  };

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);
  
  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const months = useMemo(() => getAvailableMonths(processedData), [processedData]);
  const availableYears = useMemo(() => {
    const years = getAvailableYears(processedData);
    console.log("DEBUG - Anos extraídos:", years);
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [processedData]);


  const toggleView = () => {
    setCurrentView(prev => prev === "monthly" ? "tv" : "monthly");
  };

  const dashboardData = useMemo(
    () => processDashboardData(processedData, filters.month, filters.assessor),
    [processedData, filters.month, filters.assessor]
  );

  const yearlyDashboardData = useMemo(
    () => processYearlyDashboardData(processedData, yearlyFilters.year, yearlyFilters.assessor),
    [processedData, yearlyFilters.year, yearlyFilters.assessor]
  );

  // Calculate assessor remaining data for TV mode (graphs 1 and 2)
  const assessorRemainingCaptacao = useMemo(
    () => calculateAssessorRemainingForKPI(processedData, "Captação net", filters.month),
    [processedData, filters.month]
  );

  const assessorRemainingReceita = useMemo(
    () => calculateAssessorRemainingForKPI(
      processedData, 
      "Receita", 
      filters.month, 
      ["PJ1 XP Mês", "PJ2 XP Mês"]  // Target from these categories
    ),
    [processedData, filters.month]
  );

  // Calculate assessor agendadas data for TV mode (graph 3)
  const assessorAgendadas = useMemo(
    () => calculateAssessorAgendadasForKPI(processedData, filters.month),
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

  return (
    <SidebarProvider>
      <div className="h-screen bg-background flex w-full overflow-hidden">
        <DashboardSidebar 
          visibility={visibility} 
          onVisibilityChange={handleVisibilityChange} 
        />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="w-32 flex items-center gap-2">
                  <SidebarTrigger className="p-2 hover:bg-muted rounded-md">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                </div>
                <div className="flex-1 flex justify-center">
                  <img 
                    src={eclatLogo} 
                    alt="Éclat XP Logo" 
                    className="h-8 object-contain"
                  />
                </div>
                <div className="w-32 flex justify-end items-center gap-2">
                  <ThemeToggle />
                  {hasData && (
                    <FileUpload onDataLoaded={handleDataLoaded} compact />
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden px-4 py-3">
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
            ) : currentView === "monthly" ? (
              // MONTHLY VIEW
              <div className="h-full flex flex-col gap-3 animate-fade-in">
                {/* Top Row - ICM with Filters, Meta, Assessor Ranking */}
                {visibleTopCards > 0 && (
                  <div className={`grid gap-3 min-h-0 flex-1 ${topGridCols}`}>
                    {visibility.card1 && (
                      <ICMCard
                        icmGeral={dashboardData.icmGeral}
                        ritmoIdeal={dashboardData.ritmoIdeal}
                        diasUteisRestantes={dashboardData.diasUteisRestantes}
                        assessors={assessors}
                        selectedAssessor={filters.assessor}
                        selectedMonth={filters.month}
                        months={months}
                        onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
                        onMonthChange={(value) => setFilters({ ...filters, month: value })}
                        onToggleView={toggleView}
                      />
                    )}
                    {visibility.card2 && (
                      <MetaTable
                        data={dashboardData.metaSemanal}
                        realPercentage={dashboardData.metaSemanalReal}
                        selectedAssessor={filters.assessor}
                        weekToMonthPercentage={dashboardData.metaSemanalPercentage}
                      />
                    )}
                    {visibility.card3 && (
                      <AssessorChart data={dashboardData.assessorPerformance} ritmoIdeal={dashboardData.ritmoIdeal} />
                    )}
                  </div>
                )}

                {/* KPI Gauges - Main graphs with sub-graphs */}
                {(col1Visible || col2Visible || col3Visible) && (
                  <div className={`grid gap-3 min-h-0 flex-1 ${gaugeGridCols}`}>
                    {/* Column 1: Graph 1 + Sub-graphs 4, 5 */}
                    {col1Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph1 && (
                          <GaugeChart
                            label={dashboardData.gaugeKPIs[0]?.label}
                            value={dashboardData.gaugeKPIs[0]?.value}
                            target={dashboardData.gaugeKPIs[0]?.target}
                            percentage={dashboardData.gaugeKPIs[0]?.percentage}
                            isCurrency={dashboardData.gaugeKPIs[0]?.isCurrency}
                            warning={dashboardData.gaugeKPIs[0]?.warning}
                            statusIcon={dashboardData.gaugeKPIs[0]?.statusIcon}
                            size="lg"
                            showRemaining={true}
                          />
                        )}
                        {(visibility.graph4 || visibility.graph5) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        {visibility.graph4 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[3]?.label}
                                value={dashboardData.gaugeKPIs[3]?.value}
                                target={dashboardData.gaugeKPIs[3]?.target}
                                percentage={dashboardData.gaugeKPIs[3]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[3]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[3]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[3]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                            {visibility.graph5 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[4]?.label}
                                value={dashboardData.gaugeKPIs[4]?.value}
                                target={dashboardData.gaugeKPIs[4]?.target}
                                percentage={dashboardData.gaugeKPIs[4]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[4]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[4]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[4]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 2: Graph 2 + Sub-graphs 6, 7 */}
                    {col2Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph2 && (
                          <GaugeChart
                            label={dashboardData.gaugeKPIs[1]?.label}
                            value={dashboardData.gaugeKPIs[1]?.value}
                            target={dashboardData.gaugeKPIs[1]?.target}
                            percentage={dashboardData.gaugeKPIs[1]?.percentage}
                            isCurrency={dashboardData.gaugeKPIs[1]?.isCurrency}
                            warning={dashboardData.gaugeKPIs[1]?.warning}
                            statusIcon={dashboardData.gaugeKPIs[1]?.statusIcon}
                            size="lg"
                            showRemaining={true}
                          />
                        )}
                        {(visibility.graph6 || visibility.graph7) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                            {visibility.graph6 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[5]?.label}
                                value={dashboardData.gaugeKPIs[5]?.value}
                                target={dashboardData.gaugeKPIs[5]?.target}
                                percentage={dashboardData.gaugeKPIs[5]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[5]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[5]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[5]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                            {visibility.graph7 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[6]?.label}
                                value={dashboardData.gaugeKPIs[6]?.value}
                                target={dashboardData.gaugeKPIs[6]?.target}
                                percentage={dashboardData.gaugeKPIs[6]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[6]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[6]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[6]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 3: Graph 3 + Sub-graphs 8, 9 */}
                    {col3Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph3 && (
                          <GaugeChart
                            label={dashboardData.gaugeKPIs[2]?.label}
                            value={dashboardData.gaugeKPIs[2]?.value}
                            target={dashboardData.gaugeKPIs[2]?.target}
                            percentage={dashboardData.gaugeKPIs[2]?.percentage}
                            isCurrency={dashboardData.gaugeKPIs[2]?.isCurrency}
                            warning={dashboardData.gaugeKPIs[2]?.warning}
                            statusIcon={dashboardData.gaugeKPIs[2]?.statusIcon}
                            size="lg"
                            showRemaining={true}
                            secondaryValue={dashboardData.gaugeKPIs[2]?.secondaryValue}
                            secondaryPercentage={dashboardData.gaugeKPIs[2]?.secondaryPercentage}
                            secondaryLabel={dashboardData.gaugeKPIs[2]?.secondaryLabel}
                          />
                        )}
                        {(visibility.graph8 || visibility.graph9) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                            {visibility.graph8 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[7]?.label}
                                value={dashboardData.gaugeKPIs[7]?.value}
                                target={dashboardData.gaugeKPIs[7]?.target}
                                percentage={dashboardData.gaugeKPIs[7]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[7]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[7]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[7]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                            {visibility.graph9 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[8]?.label}
                                value={dashboardData.gaugeKPIs[8]?.value}
                                target={dashboardData.gaugeKPIs[8]?.target}
                                percentage={dashboardData.gaugeKPIs[8]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[8]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[8]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[8]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // TV VIEW - Cópia exata da visão mensal
              <div className="h-full flex flex-col gap-3 animate-fade-in">
                {/* Top Row - ICM with Filters, Meta, Assessor Ranking */}
                {visibleTopCards > 0 && (
                  <div className={`grid gap-3 min-h-0 flex-1 ${topGridCols}`}>
                    {visibility.card1 && (
                      <ICMCard
                        icmGeral={dashboardData.icmGeral}
                        ritmoIdeal={dashboardData.ritmoIdeal}
                        diasUteisRestantes={dashboardData.diasUteisRestantes}
                        assessors={assessors}
                        selectedAssessor={filters.assessor}
                        selectedMonth={filters.month}
                        months={months}
                        onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
                        onMonthChange={(value) => setFilters({ ...filters, month: value })}
                        onToggleView={toggleView}
                        isTvMode={true}
                      />
                    )}
                    {visibility.card2 && (
                      <MetaTable
                        data={dashboardData.metaSemanal}
                        realPercentage={dashboardData.metaSemanalReal}
                        selectedAssessor={filters.assessor}
                        weekToMonthPercentage={dashboardData.metaSemanalPercentage}
                        isTvMode={true}
                      />
                    )}
                    {visibility.card3 && (
                      <AssessorChart data={dashboardData.assessorPerformance} ritmoIdeal={dashboardData.ritmoIdeal} isTvMode={true} />
                    )}
                  </div>
                )}

                {/* KPI Gauges - Main graphs with sub-graphs */}
                {(col1Visible || col2Visible || col3Visible) && (
                  <div className={`grid gap-3 min-h-0 flex-1 ${gaugeGridCols}`}>
                    {/* Column 1: Graph 1 + Sub-graphs 4, 5 */}
                    {col1Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph1 && (
                          <div className="flex gap-2 h-full">
                            <div className="flex-1 h-full">
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[0]?.label}
                                value={dashboardData.gaugeKPIs[0]?.value}
                                target={dashboardData.gaugeKPIs[0]?.target}
                                percentage={dashboardData.gaugeKPIs[0]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[0]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[0]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[0]?.statusIcon}
                                size="lg"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            </div>
                            <AssessorRemainingMatrix
                              assessorData={assessorRemainingCaptacao}
                              isCurrency={true}
                              isTvMode={true}
                            />
                          </div>
                        )}
                        {(visibility.graph4 || visibility.graph5) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                            {visibility.graph4 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[3]?.label}
                                value={dashboardData.gaugeKPIs[3]?.value}
                                target={dashboardData.gaugeKPIs[3]?.target}
                                percentage={dashboardData.gaugeKPIs[3]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[3]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[3]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[3]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                            {visibility.graph5 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[4]?.label}
                                value={dashboardData.gaugeKPIs[4]?.value}
                                target={dashboardData.gaugeKPIs[4]?.target}
                                percentage={dashboardData.gaugeKPIs[4]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[4]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[4]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[4]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 2: Graph 2 + Sub-graphs 6, 7 */}
                    {col2Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph2 && (
                          <div className="flex gap-2 h-full">
                            <div className="flex-1 h-full">
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[1]?.label}
                                value={dashboardData.gaugeKPIs[1]?.value}
                                target={dashboardData.gaugeKPIs[1]?.target}
                                percentage={dashboardData.gaugeKPIs[1]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[1]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[1]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[1]?.statusIcon}
                                size="lg"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            </div>
                            <AssessorRemainingMatrix
                              assessorData={assessorRemainingReceita}
                              isCurrency={true}
                              isTvMode={true}
                            />
                          </div>
                        )}
                        {(visibility.graph6 || visibility.graph7) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                            {visibility.graph6 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[5]?.label}
                                value={dashboardData.gaugeKPIs[5]?.value}
                                target={dashboardData.gaugeKPIs[5]?.target}
                                percentage={dashboardData.gaugeKPIs[5]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[5]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[5]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[5]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                            {visibility.graph7 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[6]?.label}
                                value={dashboardData.gaugeKPIs[6]?.value}
                                target={dashboardData.gaugeKPIs[6]?.target}
                                percentage={dashboardData.gaugeKPIs[6]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[6]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[6]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[6]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 3: Graph 3 + Sub-graphs 8, 9 */}
                    {col3Visible && (
                      <div className="flex flex-col gap-2 min-h-0">
                        {visibility.graph3 && (
                          <div className="flex gap-2 h-full">
                            <div className="flex-1 h-full">
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[2]?.label}
                                value={dashboardData.gaugeKPIs[2]?.value}
                                target={dashboardData.gaugeKPIs[2]?.target}
                                percentage={dashboardData.gaugeKPIs[2]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[2]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[2]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[2]?.statusIcon}
                                size="lg"
                                showRemaining={true}
                                isTvMode={true}
                                secondaryValue={dashboardData.gaugeKPIs[2]?.secondaryValue}
                                secondaryPercentage={dashboardData.gaugeKPIs[2]?.secondaryPercentage}
                                secondaryLabel={dashboardData.gaugeKPIs[2]?.secondaryLabel}
                              />
                            </div>
                            <AssessorAgendadasMatrix
                              assessorData={assessorAgendadas}
                              isTvMode={true}
                            />
                          </div>
                        )}
                        {(visibility.graph8 || visibility.graph9) && (
                          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                            {visibility.graph8 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[7]?.label}
                                value={dashboardData.gaugeKPIs[7]?.value}
                                target={dashboardData.gaugeKPIs[7]?.target}
                                percentage={dashboardData.gaugeKPIs[7]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[7]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[7]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[7]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                            {visibility.graph9 && (
                              <GaugeChart
                                label={dashboardData.gaugeKPIs[8]?.label}
                                value={dashboardData.gaugeKPIs[8]?.value}
                                target={dashboardData.gaugeKPIs[8]?.target}
                                percentage={dashboardData.gaugeKPIs[8]?.percentage}
                                isCurrency={dashboardData.gaugeKPIs[8]?.isCurrency}
                                warning={dashboardData.gaugeKPIs[8]?.warning}
                                statusIcon={dashboardData.gaugeKPIs[8]?.statusIcon}
                                size="sm"
                                showRemaining={true}
                                isTvMode={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

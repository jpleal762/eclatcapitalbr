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
import { KPIRecord, DashboardFilters, DashboardView, YearlyDashboardFilters } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  getAvailableMonths,
  processDashboardData,
} from "@/lib/kpiUtils";
import { 
  processYearlyDashboardData, 
  getAvailableYears 
} from "@/lib/yearlyKpiUtils";
import { loadExcelData, saveExcelData } from "@/lib/storage";
import eclatLogo from "@/assets/eclat-xp-logo.png";

const Index = () => {
  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>("monthly");
  const [filters, setFilters] = useState<DashboardFilters>({
    assessor: "all",
    month: "all",
  });
  const [yearlyFilters, setYearlyFilters] = useState<YearlyDashboardFilters>({
    assessor: "all",
    year: 0, // Will be set when data loads
  });

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

  const toggleView = () => {
    console.log("Toggle view clicked, current view:", currentView);
    setCurrentView(prev => {
      const newView = prev === "monthly" ? "yearly" : "monthly";
      console.log("Changing view to:", newView);
      return newView;
    });
  };

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);
  
  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const months = useMemo(() => getAvailableMonths(processedData), [processedData]);
  const availableYears = useMemo(() => getAvailableYears(processedData), [processedData]);

  // Set default year when data loads
  useEffect(() => {
    if (availableYears.length > 0 && yearlyFilters.year === 0) {
      setYearlyFilters(prev => ({ ...prev, year: availableYears[0] }));
    }
  }, [availableYears, yearlyFilters.year]);

  const dashboardData = useMemo(
    () => processDashboardData(processedData, filters.month, filters.assessor),
    [processedData, filters.month, filters.assessor]
  );

  // Only process yearly data when we have a valid year
  const selectedYear = yearlyFilters.year || availableYears[0] || new Date().getFullYear();
  const yearlyDashboardData = useMemo(
    () => processYearlyDashboardData(processedData, selectedYear, yearlyFilters.assessor),
    [processedData, selectedYear, yearlyFilters.assessor]
  );

  const hasData = rawData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-32">
              {/* Spacer for balance */}
            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src={eclatLogo} 
                alt="Éclat XP Logo" 
                className="h-10 object-contain"
              />
            </div>
            <div className="w-32 flex justify-end">
              {hasData && (
                <FileUpload onDataLoaded={handleDataLoaded} compact />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
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
          <div className="space-y-6 animate-fade-in">
            {/* Top Row - ICM with Filters, Meta, Assessor Ranking */}
            <div className="grid gap-4 lg:grid-cols-3">
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
              <MetaTable
                data={dashboardData.metaSemanal}
                realPercentage={dashboardData.metaSemanalReal}
                selectedAssessor={filters.assessor}
                weekToMonthPercentage={dashboardData.metaSemanalPercentage}
              />
              <AssessorChart data={dashboardData.assessorPerformance} />
            </div>

            {/* KPI Gauges - Main graphs with sub-graphs */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Column 1: Graph 1 + Sub-graphs 4, 5 */}
              <div className="space-y-3">
                <GaugeChart
                  label={dashboardData.gaugeKPIs[0]?.label}
                  value={dashboardData.gaugeKPIs[0]?.value}
                  target={dashboardData.gaugeKPIs[0]?.target}
                  percentage={dashboardData.gaugeKPIs[0]?.percentage}
                  isCurrency={dashboardData.gaugeKPIs[0]?.isCurrency}
                  warning={dashboardData.gaugeKPIs[0]?.warning}
                  statusIcon={dashboardData.gaugeKPIs[0]?.statusIcon}
                  size="lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[3]?.label}
                    value={dashboardData.gaugeKPIs[3]?.value}
                    target={dashboardData.gaugeKPIs[3]?.target}
                    percentage={dashboardData.gaugeKPIs[3]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[3]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[3]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[3]?.statusIcon}
                    size="sm"
                  />
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[4]?.label}
                    value={dashboardData.gaugeKPIs[4]?.value}
                    target={dashboardData.gaugeKPIs[4]?.target}
                    percentage={dashboardData.gaugeKPIs[4]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[4]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[4]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[4]?.statusIcon}
                    size="sm"
                  />
                </div>
              </div>

              {/* Column 2: Graph 2 + Sub-graphs 6, 7 */}
              <div className="space-y-3">
                <GaugeChart
                  label={dashboardData.gaugeKPIs[1]?.label}
                  value={dashboardData.gaugeKPIs[1]?.value}
                  target={dashboardData.gaugeKPIs[1]?.target}
                  percentage={dashboardData.gaugeKPIs[1]?.percentage}
                  isCurrency={dashboardData.gaugeKPIs[1]?.isCurrency}
                  warning={dashboardData.gaugeKPIs[1]?.warning}
                  statusIcon={dashboardData.gaugeKPIs[1]?.statusIcon}
                  size="lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[5]?.label}
                    value={dashboardData.gaugeKPIs[5]?.value}
                    target={dashboardData.gaugeKPIs[5]?.target}
                    percentage={dashboardData.gaugeKPIs[5]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[5]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[5]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[5]?.statusIcon}
                    size="sm"
                  />
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[6]?.label}
                    value={dashboardData.gaugeKPIs[6]?.value}
                    target={dashboardData.gaugeKPIs[6]?.target}
                    percentage={dashboardData.gaugeKPIs[6]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[6]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[6]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[6]?.statusIcon}
                    size="sm"
                  />
                </div>
              </div>

              {/* Column 3: Graph 3 + Sub-graphs 8, 9 */}
              <div className="space-y-3">
                <GaugeChart
                  label={dashboardData.gaugeKPIs[2]?.label}
                  value={dashboardData.gaugeKPIs[2]?.value}
                  target={dashboardData.gaugeKPIs[2]?.target}
                  percentage={dashboardData.gaugeKPIs[2]?.percentage}
                  isCurrency={dashboardData.gaugeKPIs[2]?.isCurrency}
                  warning={dashboardData.gaugeKPIs[2]?.warning}
                  statusIcon={dashboardData.gaugeKPIs[2]?.statusIcon}
                  size="lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[7]?.label}
                    value={dashboardData.gaugeKPIs[7]?.value}
                    target={dashboardData.gaugeKPIs[7]?.target}
                    percentage={dashboardData.gaugeKPIs[7]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[7]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[7]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[7]?.statusIcon}
                    size="sm"
                  />
                  <GaugeChart
                    label={dashboardData.gaugeKPIs[8]?.label}
                    value={dashboardData.gaugeKPIs[8]?.value}
                    target={dashboardData.gaugeKPIs[8]?.target}
                    percentage={dashboardData.gaugeKPIs[8]?.percentage}
                    isCurrency={dashboardData.gaugeKPIs[8]?.isCurrency}
                    warning={dashboardData.gaugeKPIs[8]?.warning}
                    statusIcon={dashboardData.gaugeKPIs[8]?.statusIcon}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // YEARLY VIEW - Uses yearly components and data
          <div className="space-y-6 animate-fade-in">
            {/* Top Row - ICM with Filters, Meta, Assessor Ranking */}
            <div className="grid gap-4 lg:grid-cols-3">
              <YearlyICMCard
                icmGeral={yearlyDashboardData.icmGeral}
                ritmoIdeal={yearlyDashboardData.ritmoIdeal}
                diasUteisRestantes={yearlyDashboardData.diasUteisRestantes}
                assessors={assessors}
                selectedAssessor={yearlyFilters.assessor}
                selectedYear={selectedYear}
                availableYears={availableYears}
                onAssessorChange={(value) => setYearlyFilters({ ...yearlyFilters, assessor: value })}
                onYearChange={(value) => setYearlyFilters({ ...yearlyFilters, year: value })}
                onToggleView={toggleView}
              />
              <YearlyMetaTable
                gaugeKPIs={yearlyDashboardData.gaugeKPIs}
                selectedAssessor={yearlyFilters.assessor}
              />
              <YearlyAssessorChart data={yearlyDashboardData.assessorPerformance} />
            </div>

            {/* KPI Gauges - Same as monthly but with gray bars */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Column 1: Graph 1 + Sub-graphs 4, 5 */}
              <div className="space-y-3">
                <GaugeChart
                  label={yearlyDashboardData.gaugeKPIs[0]?.label}
                  value={yearlyDashboardData.gaugeKPIs[0]?.value}
                  target={yearlyDashboardData.gaugeKPIs[0]?.target}
                  percentage={yearlyDashboardData.gaugeKPIs[0]?.percentage}
                  isCurrency={yearlyDashboardData.gaugeKPIs[0]?.isCurrency}
                  warning={yearlyDashboardData.gaugeKPIs[0]?.warning}
                  statusIcon={yearlyDashboardData.gaugeKPIs[0]?.statusIcon}
                  size="lg"
                  isYearlyView={true}
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[3]?.label}
                    value={yearlyDashboardData.gaugeKPIs[3]?.value}
                    target={yearlyDashboardData.gaugeKPIs[3]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[3]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[3]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[3]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[3]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[4]?.label}
                    value={yearlyDashboardData.gaugeKPIs[4]?.value}
                    target={yearlyDashboardData.gaugeKPIs[4]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[4]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[4]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[4]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[4]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                </div>
              </div>

              {/* Column 2: Graph 2 + Sub-graphs 6, 7 */}
              <div className="space-y-3">
                <GaugeChart
                  label={yearlyDashboardData.gaugeKPIs[1]?.label}
                  value={yearlyDashboardData.gaugeKPIs[1]?.value}
                  target={yearlyDashboardData.gaugeKPIs[1]?.target}
                  percentage={yearlyDashboardData.gaugeKPIs[1]?.percentage}
                  isCurrency={yearlyDashboardData.gaugeKPIs[1]?.isCurrency}
                  warning={yearlyDashboardData.gaugeKPIs[1]?.warning}
                  statusIcon={yearlyDashboardData.gaugeKPIs[1]?.statusIcon}
                  size="lg"
                  isYearlyView={true}
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[5]?.label}
                    value={yearlyDashboardData.gaugeKPIs[5]?.value}
                    target={yearlyDashboardData.gaugeKPIs[5]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[5]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[5]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[5]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[5]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[6]?.label}
                    value={yearlyDashboardData.gaugeKPIs[6]?.value}
                    target={yearlyDashboardData.gaugeKPIs[6]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[6]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[6]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[6]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[6]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                </div>
              </div>

              {/* Column 3: Graph 3 + Sub-graphs 8, 9 */}
              <div className="space-y-3">
                <GaugeChart
                  label={yearlyDashboardData.gaugeKPIs[2]?.label}
                  value={yearlyDashboardData.gaugeKPIs[2]?.value}
                  target={yearlyDashboardData.gaugeKPIs[2]?.target}
                  percentage={yearlyDashboardData.gaugeKPIs[2]?.percentage}
                  isCurrency={yearlyDashboardData.gaugeKPIs[2]?.isCurrency}
                  warning={yearlyDashboardData.gaugeKPIs[2]?.warning}
                  statusIcon={yearlyDashboardData.gaugeKPIs[2]?.statusIcon}
                  size="lg"
                  isYearlyView={true}
                />
                <div className="grid grid-cols-2 gap-2">
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[7]?.label}
                    value={yearlyDashboardData.gaugeKPIs[7]?.value}
                    target={yearlyDashboardData.gaugeKPIs[7]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[7]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[7]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[7]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[7]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                  <GaugeChart
                    label={yearlyDashboardData.gaugeKPIs[8]?.label}
                    value={yearlyDashboardData.gaugeKPIs[8]?.value}
                    target={yearlyDashboardData.gaugeKPIs[8]?.target}
                    percentage={yearlyDashboardData.gaugeKPIs[8]?.percentage}
                    isCurrency={yearlyDashboardData.gaugeKPIs[8]?.isCurrency}
                    warning={yearlyDashboardData.gaugeKPIs[8]?.warning}
                    statusIcon={yearlyDashboardData.gaugeKPIs[8]?.statusIcon}
                    size="sm"
                    isYearlyView={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Dashboard de Performance dos Assessores © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

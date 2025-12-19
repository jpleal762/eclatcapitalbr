import { useState, useMemo } from "react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ICMCard } from "@/components/dashboard/ICMCard";
import { MetaTable } from "@/components/dashboard/MetaTable";
import { AssessorChart } from "@/components/dashboard/AssessorChart";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { KPIRecord, DashboardFilters } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  getAvailableMonths,
  processDashboardData,
} from "@/lib/kpiUtils";

const Index = () => {
  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    assessor: "all",
    month: "all",
  });

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);
  
  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const months = useMemo(() => getAvailableMonths(processedData), [processedData]);

  const dashboardData = useMemo(
    () => processDashboardData(processedData, filters.month, filters.assessor),
    [processedData, filters.month, filters.assessor]
  );

  const hasData = rawData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light tracking-wide text-foreground">êclat</span>
              <span className="text-muted-foreground">|</span>
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm font-bold">XP</span>
            </div>
            {hasData && (
              <FileUpload onDataLoaded={setRawData} compact />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!hasData ? (
          <div className="mx-auto max-w-xl animate-fade-in pt-12">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Bem-vindo ao Dashboard</h2>
              <p className="text-muted-foreground">
                Carregue seus dados KPI em formato XLSX ou JSON para visualizar as métricas de performance
              </p>
            </div>
            <FileUpload onDataLoaded={setRawData} />
          </div>
        ) : (
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

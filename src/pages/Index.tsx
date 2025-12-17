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
              />
              <AssessorChart data={dashboardData.assessorPerformance} />
            </div>

            {/* KPI Gauges Row 1 - Graphs 1, 2, 3 */}
            <div className="grid gap-4 lg:grid-cols-3">
              {dashboardData.gaugeKPIs.slice(0, 3).map((kpi, index) => (
                <GaugeChart
                  key={index}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={kpi.isCurrency}
                  warning={kpi.warning}
                  size="lg"
                />
              ))}
            </div>

            {/* KPI Gauges Row 2 - Graph 4 */}
            <div className="grid gap-4 lg:grid-cols-3">
              {dashboardData.gaugeKPIs.slice(3, 6).map((kpi, index) => (
                <GaugeChart
                  key={`row2-${index}`}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={kpi.isCurrency}
                  warning={kpi.warning}
                  size="lg"
                />
              ))}
            </div>

            {/* KPI Gauges Row 3 - Remaining graphs */}
            <div className="grid gap-4 lg:grid-cols-3">
              {dashboardData.gaugeKPIs.slice(6).map((kpi, index) => (
                <GaugeChart
                  key={`row3-${index}`}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={kpi.isCurrency}
                  warning={kpi.warning}
                  size="lg"
                />
              ))}
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

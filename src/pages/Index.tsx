import { useState, useMemo } from "react";
import { Users, Target, TrendingUp, Award, LayoutDashboard } from "lucide-react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { KPICard } from "@/components/dashboard/KPICard";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { Filters } from "@/components/dashboard/Filters";
import { KPIRecord, ProcessedKPI, DashboardFilters } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  calculateSummary,
  aggregateMonthlyData,
  getAssessorPerformance,
  getCategoryDistribution,
} from "@/lib/kpiUtils";

const Index = () => {
  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    assessor: "all",
    category: "all",
    status: "all",
  });

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);

  const filteredData = useMemo(() => {
    return processedData.filter((item) => {
      if (filters.assessor !== "all" && item.assessor !== filters.assessor) return false;
      if (filters.category !== "all" && item.category !== filters.category) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      return true;
    });
  }, [processedData, filters]);

  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const categories = useMemo(() => getUniqueValues(processedData, "category"), [processedData]);
  const statuses = useMemo(() => getUniqueValues(processedData, "status"), [processedData]);

  const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);
  const monthlyData = useMemo(() => aggregateMonthlyData(filteredData), [filteredData]);
  const performanceData = useMemo(() => getAssessorPerformance(filteredData), [filteredData]);
  const categoryData = useMemo(() => getCategoryDistribution(filteredData), [filteredData]);

  const hasData = rawData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-2.5">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Painel de Performance
              </h1>
              <p className="text-sm text-muted-foreground">
                KPIs dos Assessores
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!hasData ? (
          /* Upload Section */
          <div className="mx-auto max-w-xl animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Dashboard</h2>
              <p className="text-muted-foreground">
                Carregue seus dados KPI para visualizar as métricas de performance
              </p>
            </div>
            <FileUpload onDataLoaded={setRawData} />
          </div>
        ) : (
          /* Dashboard Content */
          <div className="space-y-8 animate-fade-in">
          {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Filters
                filters={filters}
                assessors={assessors}
                categories={categories}
                statuses={statuses}
                onFilterChange={setFilters}
              />
              <FileUpload onDataLoaded={setRawData} compact />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total de Assessores"
                value={summary.totalAssessors}
                subtitle={`${categories.length} categorias`}
                icon={Users}
                variant="primary"
              />
              <KPICard
                title="Meta Planejada"
                value={summary.totalPlanned}
                subtitle="Total do período"
                icon={Target}
                variant="default"
              />
              <KPICard
                title="Total Realizado"
                value={summary.totalRealized}
                subtitle="Entregas concluídas"
                icon={TrendingUp}
                variant="success"
              />
              <KPICard
                title="Performance Geral"
                value={`${summary.avgPerformance.toFixed(1)}%`}
                subtitle="Realizado / Planejado"
                icon={Award}
                trend={summary.avgPerformance >= 100 ? "up" : summary.avgPerformance >= 70 ? "neutral" : "down"}
                trendValue={summary.avgPerformance >= 100 ? "Meta atingida" : "Em progresso"}
                variant="warning"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
              <MonthlyChart data={monthlyData} />
              <PerformanceChart data={performanceData} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <CategoryChart data={categoryData} />
              </div>
              <div className="lg:col-span-2">
                <DataTable data={filteredData} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          Dashboard de Performance dos Assessores © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

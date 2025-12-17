import { useState, useMemo } from "react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ICMCard } from "@/components/dashboard/ICMCard";
import { MetaTable } from "@/components/dashboard/MetaTable";
import { AssessorChart } from "@/components/dashboard/AssessorChart";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { KPIRecord, DashboardFilters, ProcessedKPI } from "@/types/kpi";
import {
  processKPIData,
  getUniqueValues,
  getAvailableMonths,
  processDashboardData,
} from "@/lib/kpiUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [rawData, setRawData] = useState<KPIRecord[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    assessor: "all",
    month: "all",
  });

  const processedData = useMemo(() => processKPIData(rawData), [rawData]);
  
  const assessors = useMemo(() => getUniqueValues(processedData, "assessor"), [processedData]);
  const months = useMemo(() => getAvailableMonths(processedData), [processedData]);

  const filteredData = useMemo(() => {
    let data = processedData;
    if (filters.assessor !== "all") {
      data = data.filter((item) => item.assessor === filters.assessor);
    }
    return data;
  }, [processedData, filters.assessor]);

  const dashboardData = useMemo(
    () => processDashboardData(filteredData, filters.month),
    [filteredData, filters.month]
  );

  const hasData = rawData.length > 0;

  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${monthNames[now.getMonth()]}-${now.getFullYear()}`;
  };

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
          /* Upload Section */
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
          /* Dashboard Content */
          <div className="space-y-6 animate-fade-in">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={filters.assessor}
                onValueChange={(value) => setFilters({ ...filters, assessor: value })}
              >
                <SelectTrigger className="w-[200px] bg-card">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {assessors.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.split(" ").slice(0, 2).join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.month}
                onValueChange={(value) => setFilters({ ...filters, month: value })}
              >
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder={getCurrentMonthLabel()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Top Row - ICM, Meta, Assessor Performance */}
            <div className="grid gap-4 lg:grid-cols-3">
              <ICMCard
                icmGeral={dashboardData.icmGeral}
                ritmoIdeal={dashboardData.ritmoIdeal}
                diasUteisRestantes={dashboardData.diasUteisRestantes}
              />
              <MetaTable
                data={dashboardData.metaSemanal}
                realPercentage={dashboardData.metaSemanalReal}
              />
              <AssessorChart data={dashboardData.assessorPerformance} />
            </div>

            {/* Middle Row - Main Gauge Charts */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            {/* Bottom Row - Smaller Gauge Charts */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {dashboardData.gaugeKPIs.slice(3, 5).map((kpi, index) => (
                <GaugeChart
                  key={`small-${index}`}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={kpi.isCurrency}
                  warning={kpi.warning}
                  size="sm"
                />
              ))}
              
              {/* Head Bruno highlighted cards */}
              {dashboardData.headBruno.slice(0, 2).map((kpi, index) => (
                <GaugeChart
                  key={`bruno-${index}`}
                  label={`Receita PJ${index + 1} XP`}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={true}
                  warning={kpi.warning}
                  size="sm"
                  variant="highlight"
                />
              ))}

              {dashboardData.gaugeKPIs.slice(5, 7).map((kpi, index) => (
                <GaugeChart
                  key={`extra-${index}`}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  percentage={kpi.percentage}
                  isCurrency={kpi.isCurrency}
                  warning={kpi.warning}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Dashboard de Performance dos Assessores © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

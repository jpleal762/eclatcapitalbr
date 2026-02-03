import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateWeeklyReport } from "@/lib/reportUtils";
import { DashboardData } from "@/types/kpi";

interface ReportButtonProps {
  dashboardData: DashboardData;
  selectedAssessor: string;
  selectedMonth: string;
  disabled?: boolean;
}

export function ReportButton({
  dashboardData,
  selectedAssessor,
  selectedMonth,
  disabled = false,
}: ReportButtonProps) {
  const handleGenerateReport = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    
    try {
      const fileName = generateWeeklyReport(
        dashboardData,
        selectedAssessor,
        selectedMonth
      );
      toast.success(`Relatório gerado: ${fileName}`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const visao = selectedAssessor === "all" 
    ? "Escritório" 
    : selectedAssessor.split(" ").slice(0, 2).join(" ");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateReport}
      disabled={disabled}
      className="h-7 text-responsive-xs gap-1.5 bg-primary/10 hover:bg-primary/20 border-primary/30"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Relatório</span>
      <span className="text-muted-foreground hidden md:inline">({visao})</span>
    </Button>
  );
}

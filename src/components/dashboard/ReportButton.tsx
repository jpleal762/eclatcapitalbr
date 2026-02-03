import { FileText } from "lucide-react";
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
      toast.success(`Relatório PDF gerado: ${fileName}`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateReport}
      disabled={disabled}
      className="h-6 text-responsive-xs gap-1 px-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
    >
      <FileText className="w-3 h-3" />
      <span className="hidden sm:inline">Relatório</span>
    </Button>
  );
}

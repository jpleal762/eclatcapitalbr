import ExcelJS from "exceljs";
import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { toast } from "sonner";

export async function exportDatabaseToXLSX() {
  const supabase = getAuthedClient();
  try {
    const { data, error } = await supabase
      .from("kpi_records")
      .select("assessor, categorias, status, monthly_data")
      .order("assessor")
      .order("categorias")
      .order("status");

    if (error) throw error;
    if (!data || data.length === 0) {
      toast.error("Nenhum dado encontrado para exportar.");
      return;
    }

    // Collect all month keys
    const monthKeysSet = new Set<string>();
    for (const row of data) {
      const md = row.monthly_data as Record<string, unknown>;
      Object.keys(md).forEach((k) => monthKeysSet.add(k));
    }

    // Sort month keys chronologically
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthKeys = Array.from(monthKeysSet).sort((a, b) => {
      const [mA, yA] = a.split("-");
      const [mB, yB] = b.split("-");
      if (yA !== yB) return parseInt(yA) - parseInt(yB);
      return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Base de Dados");

    // Header row
    const headers = ["Assessor", "Categorias", "Status", ...monthKeys];
    worksheet.addRow(headers);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
    });

    // Data rows
    for (const row of data) {
      const md = row.monthly_data as Record<string, unknown>;
      const rowData = [
        row.assessor,
        row.categorias,
        row.status,
        ...monthKeys.map((k) => (md[k] !== undefined && md[k] !== null ? md[k] : 0)),
      ];
      worksheet.addRow(rowData);
    }

    // Auto-fit columns
    worksheet.columns.forEach((col) => {
      col.width = 18;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `base_dados_${today}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Arquivo exportado com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar:", err);
    toast.error("Erro ao exportar dados.");
  }
}

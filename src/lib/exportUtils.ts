import * as XLSX from "xlsx";
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

    // Build rows
    const rows = data.map((row) => {
      const md = row.monthly_data as Record<string, unknown>;
      const obj: Record<string, unknown> = {
        Assessor: row.assessor,
        Categorias: row.categorias,
        Status: row.status,
      };
      for (const key of monthKeys) {
        obj[key] = md[key] ?? 0;
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base de Dados");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `base_dados_${today}.xlsx`);
    toast.success("Arquivo exportado com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar:", err);
    toast.error("Erro ao exportar dados.");
  }
}

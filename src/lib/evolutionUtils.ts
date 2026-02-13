import { supabase } from "@/integrations/supabase/client";
import { KPIRecord } from "@/types/kpi";
import { KPI_CATEGORIES } from "@/lib/kpiUtils";

export interface KPIEvolutionItem {
  label: string;
  category: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  deltaPercentage: number;
  isCurrency: boolean;
}

export interface SnapshotRecord {
  id: string;
  created_at: string;
  snapshot_data: KPIRecord[];
  month: string;
  record_count: number;
}

/**
 * Save a snapshot of current KPI data
 */
export async function saveKPISnapshot(
  data: KPIRecord[],
  createdBy?: string
): Promise<boolean> {
  try {
    // Determine the reference month from the data (most recent month with data)
    const month = detectCurrentMonth(data);

    const { error } = await (supabase as any)
      .from('kpi_snapshots')
      .insert({
        snapshot_data: data,
        month,
        record_count: data.length,
        created_by: createdBy || null,
      });

    if (error) {
      console.error("❌ Error saving KPI snapshot:", error);
      return false;
    }

    console.log("✅ KPI snapshot saved successfully");

    // Cleanup: keep only the last 30 snapshots
    await cleanupOldSnapshots(30);

    return true;
  } catch (error) {
    console.error("❌ Error saving KPI snapshot:", error);
    return false;
  }
}

/**
 * Get the snapshot closest to N days ago
 */
export async function getSnapshotFromDaysAgo(days: number): Promise<SnapshotRecord | null> {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);

    const { data, error } = await (supabase as any)
      .from('kpi_snapshots')
      .select('*')
      .lte('created_at', targetDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return data as unknown as SnapshotRecord;
  } catch {
    return null;
  }
}

/**
 * Calculate KPI evolution between current data and a previous snapshot
 */
export function calculateKPIEvolution(
  currentData: KPIRecord[],
  previousSnapshot: KPIRecord[],
  assessor: string = "all"
): KPIEvolutionItem[] {
  const results: KPIEvolutionItem[] = [];

  for (const kpiConfig of KPI_CATEGORIES) {
    const currentValue = sumRealizedForCategory(currentData, kpiConfig.category, assessor);
    const previousValue = sumRealizedForCategory(previousSnapshot, kpiConfig.category, assessor);

    const delta = currentValue - previousValue;
    const deltaPercentage = previousValue > 0 ? ((delta / previousValue) * 100) : (delta > 0 ? 100 : 0);

    results.push({
      label: kpiConfig.label,
      category: kpiConfig.category,
      currentValue,
      previousValue,
      delta,
      deltaPercentage,
      isCurrency: kpiConfig.isCurrency,
    });
  }

  return results;
}

/**
 * Sum "Realizado" values across all months for a given category
 */
function sumRealizedForCategory(
  data: KPIRecord[],
  category: string,
  assessor: string = "all"
): number {
  return data
    .filter(record => {
      const catMatch = record.Categorias === category;
      const statusMatch = record.Status?.toLowerCase().includes("realizado");
      const assessorMatch = assessor === "all" || record.Assessor === assessor;
      return catMatch && statusMatch && assessorMatch;
    })
    .reduce((sum, record) => {
      let total = 0;
      for (const [key, value] of Object.entries(record)) {
        if (!["Assessor", "Categorias", "Status"].includes(key)) {
          const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
          total += num;
        }
      }
      return sum + total;
    }, 0);
}

/**
 * Detect the most recent month with data
 */
function detectCurrentMonth(data: KPIRecord[]): string {
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const now = new Date();
  return `${monthNames[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
}

/**
 * Keep only the N most recent snapshots
 */
async function cleanupOldSnapshots(keepCount: number): Promise<void> {
  try {
    const { data } = await (supabase as any)
      .from('kpi_snapshots')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (data && data.length > keepCount) {
      const toDelete = data.slice(keepCount).map((s: any) => s.id);
      await (supabase as any)
        .from('kpi_snapshots')
        .delete()
        .in('id', toDelete);
    }
  } catch {}
}

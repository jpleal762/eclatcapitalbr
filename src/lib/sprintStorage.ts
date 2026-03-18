import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { SprintKPIData, SprintEvolution, SprintEvolution48h } from "@/types/kpi";
import type { Json } from "@/integrations/supabase/types";

interface SprintSnapshotData {
  timestamp: string;
  kpis: {
    category: string;
    totalRemaining: number;
    totalRealized: number;
    totalTarget: number;
  }[];
  kpisCompleted: number;
  totalProduced: number;
}

interface SprintSnapshot {
  id: string;
  month: string;
  snapshot_data: SprintSnapshotData;
  created_at: string;
}

/**
 * Save a snapshot of current sprint data to the database
 */
export async function saveSprintSnapshot(
  month: string,
  sprintData: SprintKPIData[]
): Promise<boolean> {
  try {
    const supabase = getAuthedClient();
    const snapshotData: SprintSnapshotData = {
      timestamp: new Date().toISOString(),
      kpis: sprintData.map(kpi => ({
        category: kpi.category,
        totalRemaining: kpi.totalRemaining,
        totalRealized: kpi.totalRealized,
        totalTarget: kpi.totalTarget,
      })),
      kpisCompleted: sprintData.filter(k => k.isCompleted).length,
      totalProduced: sprintData.reduce((sum, k) => sum + k.totalRealized, 0),
    };

    const { error } = await supabase
      .from("sprint_snapshots")
      .insert([{
        month,
        snapshot_data: JSON.parse(JSON.stringify(snapshotData)) as Json,
      }]);

    if (error) {
      console.error("Error saving sprint snapshot:", error);
      return false;
    }

    // Clean old snapshots (keep only last 10 per month)
    await cleanOldSnapshots(month);

    return true;
  } catch (err) {
    console.error("Unexpected error saving snapshot:", err);
    return false;
  }
}

/**
 * Get the latest snapshot that is at least minHoursAgo hours old
 */
export async function getLatestSnapshot(
  month: string,
  minHoursAgo: number = 24
): Promise<SprintSnapshot | null> {
  try {
    const supabase = getAuthedClient();
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - minHoursAgo);

    const { data, error } = await supabase
      .from("sprint_snapshots")
      .select("*")
      .eq("month", month)
      .lt("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sprint snapshot:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      month: data.month,
      snapshot_data: data.snapshot_data as unknown as SprintSnapshotData,
      created_at: data.created_at ?? new Date().toISOString(),
    };
  } catch (err) {
    console.error("Unexpected error fetching snapshot:", err);
    return null;
  }
}

/**
 * Calculate evolution between current data and a previous snapshot
 */
export function calculateEvolution(
  currentData: SprintKPIData[],
  previousSnapshot: SprintSnapshot
): Map<string, SprintEvolution> {
  const evolutionMap = new Map<string, SprintEvolution>();
  const snapshotData = previousSnapshot.snapshot_data;
  
  const hoursAgo = Math.round(
    (Date.now() - new Date(previousSnapshot.created_at).getTime()) / (1000 * 60 * 60)
  );

  currentData.forEach(current => {
    const previous = snapshotData.kpis.find(k => k.category === current.category);
    
    if (previous) {
      const difference = current.totalRealized - previous.totalRealized;
      const percentageChange = previous.totalRealized > 0
        ? ((difference / previous.totalRealized) * 100)
        : (difference > 0 ? 100 : 0);

      evolutionMap.set(current.category, {
        difference,
        percentageChange,
        hoursAgo,
      });
    }
  });

  return evolutionMap;
}

/**
 * Calculate global 48h evolution stats
 */
export function calculateEvolution48h(
  currentData: SprintKPIData[],
  previousSnapshot: SprintSnapshot
): SprintEvolution48h {
  const snapshotData = previousSnapshot.snapshot_data;
  
  const hoursAgo = Math.round(
    (Date.now() - new Date(previousSnapshot.created_at).getTime()) / (1000 * 60 * 60)
  );

  const currentProduced = currentData.reduce((sum, k) => sum + k.totalRealized, 0);
  const currentCompleted = currentData.filter(k => k.isCompleted).length;

  return {
    hoursAgo,
    totalProducedBefore: snapshotData.totalProduced,
    totalProducedNow: currentProduced,
    totalProducedDiff: currentProduced - snapshotData.totalProduced,
    kpisCompletedBefore: snapshotData.kpisCompleted,
    kpisCompletedNow: currentCompleted,
    kpisCompletedDiff: currentCompleted - snapshotData.kpisCompleted,
  };
}

/**
 * Clean old snapshots, keeping only the last N per month
 */
async function cleanOldSnapshots(month: string, keepCount: number = 10): Promise<void> {
  try {
    const supabase = getAuthedClient();
    // Get all snapshots for this month ordered by date
    const { data: snapshots, error: fetchError } = await supabase
      .from("sprint_snapshots")
      .select("id, created_at")
      .eq("month", month)
      .order("created_at", { ascending: false });

    if (fetchError || !snapshots) return;

    // If we have more than keepCount, delete the older ones
    if (snapshots.length > keepCount) {
      const idsToDelete = snapshots.slice(keepCount).map(s => s.id);
      
      await supabase
        .from("sprint_snapshots")
        .delete()
        .in("id", idsToDelete);
    }
  } catch (err) {
    console.error("Error cleaning old snapshots:", err);
  }
}

import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { KPIRecord } from "@/types/kpi";
import { saveKPISnapshot } from "@/lib/evolutionUtils";

/**
 * Save Excel data to cloud database (replaces existing data)
 */
export async function saveExcelData(
  data: KPIRecord[],
  options?: { createdBy?: string; updatedBy?: string }
): Promise<boolean> {
  try {
    const supabase = getAuthedClient();
    // Save snapshot of current data before replacing
    const existingData = await loadExcelData();
    if (existingData && existingData.length > 0) {
      await saveKPISnapshot(existingData, options?.createdBy);
    }

    // Clear existing data
    const { error: deleteError } = await supabase
      .from('kpi_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error("❌ Error clearing existing data:", deleteError);
    }

    // Transform records to database format
    const records = data.map(record => ({
      assessor: record.Assessor,
      categorias: record.Categorias,
      status: record.Status,
      monthly_data: Object.fromEntries(
        Object.entries(record).filter(([key]) => !['Assessor', 'Categorias', 'Status'].includes(key))
      ),
      ...(options?.createdBy && { created_by: options.createdBy }),
      ...(options?.updatedBy && { updated_by: options.updatedBy }),
    }));
    
    // Insert new data in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase.from('kpi_records').insert(batch);
      
      if (error) {
        console.error("❌ Error inserting batch:", error);
        throw error;
      }
    }
    
    // Save snapshot of new data
    await saveKPISnapshot(data, options?.createdBy);
    
    console.log("✅ Excel data saved to cloud successfully");
    return true;
  } catch (error) {
    console.error("❌ Error saving Excel data:", error);
    return false;
  }
}

/**
 * Load Excel data from cloud database
 */
export async function loadExcelData(): Promise<KPIRecord[] | null> {
  try {
    const supabase = getAuthedClient();
    const { data, error } = await supabase
      .from('kpi_records')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      console.log("ℹ️ No Excel data found in cloud");
      return null;
    }
    
    // Transform back to KPIRecord format
    const records: KPIRecord[] = data.map(row => ({
      Assessor: row.assessor,
      Categorias: row.categorias,
      Status: row.status,
      ...(row.monthly_data as Record<string, unknown>)
    }));
    
    console.log("✅ Excel data loaded from cloud successfully");
    return records;
  } catch (error) {
    console.error("❌ Error loading Excel data:", error);
    return null;
  }
}

/**
 * Clear Excel data from cloud database
 */
export async function clearExcelData(): Promise<boolean> {
  try {
    const supabase = getAuthedClient();
    const { error } = await supabase
      .from('kpi_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) throw error;
    
    console.log("✅ Excel data cleared from cloud successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing Excel data:", error);
    return false;
  }
}

/**
 * Check if there's stored data in cloud
 */
export async function hasStoredData(): Promise<boolean> {
  try {
    const supabase = getAuthedClient();
    const { count, error } = await supabase
      .from('kpi_records')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return (count ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error checking stored data:", error);
    return false;
  }
}

/**
 * Get the timestamp of the last update from cloud database
 */
export async function getLastUpdateTimestamp(): Promise<string | null> {
  try {
    const supabase = getAuthedClient();
    const { data, error } = await supabase
      .from('kpi_records')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return data.updated_at;
  } catch {
    return null;
  }
}

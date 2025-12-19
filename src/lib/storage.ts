import { KPIRecord } from "@/types/kpi";

const STORAGE_KEY = "dashboard-excel-data";

/**
 * Save Excel data to persistent storage
 */
export async function saveExcelData(data: KPIRecord[]): Promise<boolean> {
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, dataString);
    console.log("✅ Excel data saved successfully");
    return true;
  } catch (error) {
    console.error("❌ Error saving Excel data:", error);
    return false;
  }
}

/**
 * Load Excel data from persistent storage
 */
export async function loadExcelData(): Promise<KPIRecord[] | null> {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const data = JSON.parse(storedData) as KPIRecord[];
      console.log("✅ Excel data loaded successfully");
      return data;
    } else {
      console.log("ℹ️ No Excel data found in storage");
      return null;
    }
  } catch (error) {
    console.error("❌ Error loading Excel data:", error);
    return null;
  }
}

/**
 * Clear Excel data from storage
 */
export async function clearExcelData(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("✅ Excel data cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing Excel data:", error);
    return false;
  }
}

/**
 * Check if there's stored data
 */
export function hasStoredData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

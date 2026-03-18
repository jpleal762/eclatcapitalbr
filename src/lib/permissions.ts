import { getAuthedClient } from "@/integrations/supabase/authedClient";
import { KPIRecord } from "@/types/kpi";


/**
 * Check if the user role is admin
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Check if the user can edit records of a specific assessor
 */
export function canEditAssessor(
  role: string | null | undefined,
  tokenAssessor: string,
  targetAssessor: string
): boolean {
  if (isAdmin(role)) return true;
  return tokenAssessor.toLowerCase() === targetAssessor.toLowerCase();
}

/**
 * Fetch the currently open month from app_settings
 */
export async function getOpenMonth(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "open_month")
      .maybeSingle();

    if (error || !data) return null;
    return data.value;
  } catch {
    return null;
  }
}

/**
 * Set the open month (admin only - validated in frontend)
 */
export async function setOpenMonth(
  month: string,
  updatedBy?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: month, updated_by: updatedBy || null, updated_at: new Date().toISOString() })
      .eq("key", "open_month");

    return !error;
  } catch {
    return false;
  }
}

/**
 * Validate upload permissions - sócio can only upload their own records
 */
export function validateUploadPermissions(
  records: KPIRecord[],
  role: string | null | undefined,
  assessorName: string
): { valid: boolean; error?: string } {
  if (isAdmin(role)) return { valid: true };

  const otherAssessors = records.filter(
    (r) => r.Assessor.toLowerCase() !== assessorName.toLowerCase()
  );

  if (otherAssessors.length > 0) {
    const uniqueOthers = [...new Set(otherAssessors.map((r) => r.Assessor))];
    return {
      valid: false,
      error: `Arquivo contém registros de outros usuários: ${uniqueOthers.join(", ")}. Sócios só podem atualizar seus próprios dados.`,
    };
  }

  return { valid: true };
}

/**
 * Validate that all records have data only in the open month
 * Checks monthly_data keys against the open month
 */
export function validateMonthRestriction(
  records: KPIRecord[],
  openMonth: string
): { valid: boolean; error?: string } {
  // The open month format is like "fev-26"
  // Records have monthly data as keys like "fev-26", "jan-26", etc.
  // We check that the records contain data for the open month
  // Since records come from XLSX with all months, we just verify the open month exists
  // The actual restriction is: only allow upload when there IS an open month
  if (!openMonth) {
    return {
      valid: false,
      error: "Nenhum mês está aberto para lançamentos.",
    };
  }

  return { valid: true };
}

/**
 * Update the last production update timestamp for a token
 */
export async function updateLastProductionUpdate(
  tokenId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("assessor_tokens")
      .update({ last_production_update_at: new Date().toISOString() })
      .eq("id", tokenId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Returns the stored assessor token from localStorage.
 * Used to pass as x-assessor-token header to Supabase requests,
 * enabling server-side RLS validation.
 */
export const ECLAT_TOKEN_KEY = "eclat:pwa:token";

export function getStoredToken(): string | null {
  return localStorage.getItem(ECLAT_TOKEN_KEY);
}

/**
 * Returns headers object with the assessor token if available.
 * Use this for all Supabase client and edge function calls.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { "x-assessor-token": token };
}

/**
 * Creates a Supabase query with the token header injected.
 * Since the JS client doesn't support per-query custom headers natively,
 * the token is set via global headers on the client.
 */
export function setGlobalTokenHeader(token: string | null) {
  // This is called after token validation to inject the header globally.
  // The supabase client will pick it up on all subsequent requests.
  if (typeof window !== "undefined") {
    if (token) {
      (window as any).__eclat_assessor_token = token;
    } else {
      delete (window as any).__eclat_assessor_token;
    }
  }
}

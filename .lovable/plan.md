

## Root Cause

The `kpi_records` RLS policies require `is_valid_assessor_token(x-assessor-token header)` to be `true` for **all** operations — including admin/direct access. When a user opens the dashboard **without** a token URL (or before the token from localStorage gets set), all reads return 0 rows. Result: blank upload screen, even though data exists in the database.

Two separate problems:

**Problem 1 — Tokenless admin access is blocked.** The admin opens `/` without any `?token=…` param and no `x-assessor-token` header is sent. RLS evaluates `is_valid_assessor_token('')` → `false` → 0 rows returned → shows upload form.

**Problem 2 — Race condition on PWA load.** When a stored token exists in localStorage, `loadStoredData()` runs at the same time as `validateToken()`. `getAuthedClient()` reads the token from localStorage at that instant — but `loadStoredData` calls `getAuthedClient()` BEFORE `validateToken` has finished, meaning the token header IS present. This path should actually work; the real blocker is problem 1.

## Fix Strategy

The correct fix is: **admin (tokenless) access should also be able to read `kpi_records`**. The original intent was to restrict write access and cross-assessor reads — not to lock out the admin entirely.

### RLS Policy Change

Replace the current `kpi_records` SELECT policy with a dual-condition policy:
- Allow if `is_valid_assessor_token(header)` is true, **OR**
- Allow if `current_setting('request.headers')::json->>'x-assessor-token'` is empty/null (direct/admin access without token)

Actually the safer approach: **admin access bypasses the token check**. Since there's no Supabase Auth being used, the simplest correct approach is:

```sql
-- Allow read if either: valid token is provided, OR no token is provided at all (admin/direct access)
CREATE POLICY "Allow token or public read kpi_records" ON public.kpi_records
FOR SELECT USING (
  COALESCE(
    (current_setting('request.headers', true)::json->>'x-assessor-token'),
    ''
  ) = ''
  OR
  is_valid_assessor_token(
    COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '')
  )
);
```

This means:
- **No token header** → allowed (admin / TV / direct browser access)
- **Valid token header** → allowed
- **Invalid/expired token header** → blocked

Write policies (INSERT/UPDATE/DELETE) must also be updated the same way so admin can save/clear data.

### Files to change

1. **New migration** — Drop old RLS policies on `kpi_records`, `kpi_snapshots`, `sprint_challenges`, `sprint_snapshots`, `app_settings` and recreate them with the dual condition (no-token OR valid-token allows access).

No frontend changes needed — the flow already works correctly once RLS passes data through.

### Why this is correct

The token system's purpose is to give **individual assessors** their own locked-down URL. Admin opens the raw `/` URL — no token, full access. Assessors open `/?token=abc123` — token validates, view is locked to their data. Both paths need to read `kpi_records`. The RLS difference is already handled at the application layer (assessor filter lock via `setIsTokenLocked`).

### Files to change

1. **New DB migration** — Fix SELECT/INSERT/UPDATE/DELETE policies on `kpi_records`, `kpi_snapshots`, `sprint_challenges`, `sprint_snapshots` to allow no-token OR valid-token


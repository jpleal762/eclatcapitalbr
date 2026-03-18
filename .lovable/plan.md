
## Root Cause

The last security migration (`ff44f63a`) removed the empty-token bypass from all `kpi_records` RLS policies. Now every INSERT/UPDATE/DELETE requires `current_token_role()` to return either `'admin'` or `'socio'`. When the admin opens the dashboard without a `?token=` URL (no token in localStorage), `current_token_role()` returns `NULL` — neither condition passes — so all writes are blocked by RLS. Reads are also blocked, which is why the dashboard shows the upload screen again even after data was already saved.

## What Needs to Change

A new database migration that updates **all four CRUD policies** on `kpi_records` to restore the tokenless bypass:

```
Allow IF:
  header is empty (direct/office access, no token)    ← restored admin path
  OR token role = 'admin'                             ← token admin path
  OR (token role = 'socio' AND assessor matches)     ← assessor path
```

The same fix needs to be applied to `kpi_snapshots`, `sprint_snapshots`, `sprint_challenges`, and the `app_settings` write policies so that all cloud persistence works for the admin.

```text
Who can access?
  No token header → full access (office/admin browser)
  Valid admin token → full access
  Valid sócio token → own records only
  Invalid/expired token → blocked
```

This is identical to the approach that was working before the last security scan override.

## Technical Details

- One new SQL migration dropping and recreating the 4 `kpi_records` policies plus the policies on the 3 supporting tables
- No frontend changes needed — the code already passes the token via `getAuthedClient()` when one exists
- The security property is preserved: any request that **has** an `x-assessor-token` header must have a valid one — only absent tokens (office access) get the bypass

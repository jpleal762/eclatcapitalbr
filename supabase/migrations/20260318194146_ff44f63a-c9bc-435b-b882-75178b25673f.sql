
-- Remove the dangerous COALESCE = '' bypass from all RLS policies.
-- After this migration, access requires a valid assessor token on every request.
-- The frontend already injects the stored token via getAuthedClient() for all DB ops.

-- ============================================================
-- kpi_records
-- ============================================================
DROP POLICY IF EXISTS "Allow token or public read kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token or public insert kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token or public update kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token or public delete kpi_records" ON public.kpi_records;

CREATE POLICY "Allow token read kpi_records" ON public.kpi_records
FOR SELECT USING (
  public.current_token_role() = 'admin'
  OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

CREATE POLICY "Allow token insert kpi_records" ON public.kpi_records
FOR INSERT WITH CHECK (
  public.current_token_role() = 'admin'
  OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

CREATE POLICY "Allow token update kpi_records" ON public.kpi_records
FOR UPDATE USING (
  public.current_token_role() = 'admin'
  OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

CREATE POLICY "Allow token delete kpi_records" ON public.kpi_records
FOR DELETE USING (
  public.current_token_role() = 'admin'
  OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

-- ============================================================
-- kpi_snapshots
-- ============================================================
DROP POLICY IF EXISTS "Allow token or public read kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token or public insert kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token or public delete kpi_snapshots" ON public.kpi_snapshots;

CREATE POLICY "Allow token read kpi_snapshots" ON public.kpi_snapshots
FOR SELECT USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token insert kpi_snapshots" ON public.kpi_snapshots
FOR INSERT WITH CHECK (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token delete kpi_snapshots" ON public.kpi_snapshots
FOR DELETE USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

-- ============================================================
-- sprint_snapshots
-- ============================================================
DROP POLICY IF EXISTS "Allow token or public read sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token or public insert sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token or public delete sprint_snapshots" ON public.sprint_snapshots;

CREATE POLICY "Allow token read sprint_snapshots" ON public.sprint_snapshots
FOR SELECT USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token insert sprint_snapshots" ON public.sprint_snapshots
FOR INSERT WITH CHECK (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token delete sprint_snapshots" ON public.sprint_snapshots
FOR DELETE USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

-- ============================================================
-- sprint_challenges
-- ============================================================
DROP POLICY IF EXISTS "Allow token or public read sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token or public insert sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token or public update sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token or public delete sprint_challenges" ON public.sprint_challenges;

CREATE POLICY "Allow token read sprint_challenges" ON public.sprint_challenges
FOR SELECT USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token insert sprint_challenges" ON public.sprint_challenges
FOR INSERT WITH CHECK (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token update sprint_challenges" ON public.sprint_challenges
FOR UPDATE USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token delete sprint_challenges" ON public.sprint_challenges
FOR DELETE USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

-- ============================================================
-- app_settings — keep public SELECT (needed for open_month check before token loads),
-- restrict writes to valid tokens only
-- ============================================================
DROP POLICY IF EXISTS "Allow token or public insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow token or public update settings" ON public.app_settings;

CREATE POLICY "Allow token insert settings" ON public.app_settings
FOR INSERT WITH CHECK (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

CREATE POLICY "Allow token update settings" ON public.app_settings
FOR UPDATE USING (
  is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
);

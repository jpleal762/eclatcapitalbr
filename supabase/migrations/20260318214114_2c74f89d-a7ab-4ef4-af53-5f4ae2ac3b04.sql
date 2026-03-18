
-- Restore tokenless bypass on all tables so the admin can access without a token
-- Logic: allow if no token header (office/direct access), OR valid token (admin/socio with isolation)

-- ============================================================
-- kpi_records: drop and recreate all 4 policies
-- ============================================================
DROP POLICY IF EXISTS "Allow token read kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token insert kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token update kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token delete kpi_records" ON public.kpi_records;

CREATE POLICY "Allow token read kpi_records" ON public.kpi_records
  FOR SELECT USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.current_token_role() = 'admin'
    OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
  );

CREATE POLICY "Allow token insert kpi_records" ON public.kpi_records
  FOR INSERT WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.current_token_role() = 'admin'
    OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
  );

CREATE POLICY "Allow token update kpi_records" ON public.kpi_records
  FOR UPDATE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.current_token_role() = 'admin'
    OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
  ) WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.current_token_role() = 'admin'
    OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
  );

CREATE POLICY "Allow token delete kpi_records" ON public.kpi_records
  FOR DELETE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.current_token_role() = 'admin'
    OR (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
  );

-- ============================================================
-- kpi_snapshots: drop and recreate SELECT, INSERT, DELETE
-- ============================================================
DROP POLICY IF EXISTS "Allow token read kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token insert kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token delete kpi_snapshots" ON public.kpi_snapshots;

CREATE POLICY "Allow token read kpi_snapshots" ON public.kpi_snapshots
  FOR SELECT USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token insert kpi_snapshots" ON public.kpi_snapshots
  FOR INSERT WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token delete kpi_snapshots" ON public.kpi_snapshots
  FOR DELETE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

-- ============================================================
-- sprint_snapshots: drop and recreate SELECT, INSERT, DELETE
-- ============================================================
DROP POLICY IF EXISTS "Allow token read sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token insert sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token delete sprint_snapshots" ON public.sprint_snapshots;

CREATE POLICY "Allow token read sprint_snapshots" ON public.sprint_snapshots
  FOR SELECT USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token insert sprint_snapshots" ON public.sprint_snapshots
  FOR INSERT WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token delete sprint_snapshots" ON public.sprint_snapshots
  FOR DELETE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

-- ============================================================
-- sprint_challenges: drop and recreate all 4 policies
-- ============================================================
DROP POLICY IF EXISTS "Allow token read sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token insert sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token update sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token delete sprint_challenges" ON public.sprint_challenges;

CREATE POLICY "Allow token read sprint_challenges" ON public.sprint_challenges
  FOR SELECT USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token insert sprint_challenges" ON public.sprint_challenges
  FOR INSERT WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token update sprint_challenges" ON public.sprint_challenges
  FOR UPDATE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token delete sprint_challenges" ON public.sprint_challenges
  FOR DELETE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

-- ============================================================
-- app_settings: restore tokenless bypass for INSERT and UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Allow token insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow token update settings" ON public.app_settings;

CREATE POLICY "Allow token insert settings" ON public.app_settings
  FOR INSERT WITH CHECK (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );

CREATE POLICY "Allow token update settings" ON public.app_settings
  FOR UPDATE USING (
    COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', '') = ''
    OR public.is_valid_assessor_token(COALESCE(current_setting('request.headers', true)::json->>'x-assessor-token', ''))
  );


-- Fix RLS: allow access when no token is provided (admin/direct) OR when a valid token is provided

-- =====================
-- kpi_records
-- =====================
DROP POLICY IF EXISTS "Allow token read kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token insert kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token update kpi_records" ON public.kpi_records;
DROP POLICY IF EXISTS "Allow token delete kpi_records" ON public.kpi_records;

CREATE POLICY "Allow token or public read kpi_records" ON public.kpi_records
FOR SELECT USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public insert kpi_records" ON public.kpi_records
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public update kpi_records" ON public.kpi_records
FOR UPDATE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public delete kpi_records" ON public.kpi_records
FOR DELETE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

-- =====================
-- kpi_snapshots
-- =====================
DROP POLICY IF EXISTS "Allow token read kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token insert kpi_snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "Allow token delete kpi_snapshots" ON public.kpi_snapshots;

CREATE POLICY "Allow token or public read kpi_snapshots" ON public.kpi_snapshots
FOR SELECT USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public insert kpi_snapshots" ON public.kpi_snapshots
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public delete kpi_snapshots" ON public.kpi_snapshots
FOR DELETE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

-- =====================
-- sprint_snapshots
-- =====================
DROP POLICY IF EXISTS "Allow token read sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token insert sprint_snapshots" ON public.sprint_snapshots;
DROP POLICY IF EXISTS "Allow token delete sprint_snapshots" ON public.sprint_snapshots;

CREATE POLICY "Allow token or public read sprint_snapshots" ON public.sprint_snapshots
FOR SELECT USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public insert sprint_snapshots" ON public.sprint_snapshots
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public delete sprint_snapshots" ON public.sprint_snapshots
FOR DELETE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

-- =====================
-- sprint_challenges
-- =====================
DROP POLICY IF EXISTS "Allow token read sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token insert sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token update sprint_challenges" ON public.sprint_challenges;
DROP POLICY IF EXISTS "Allow token delete sprint_challenges" ON public.sprint_challenges;

CREATE POLICY "Allow token or public read sprint_challenges" ON public.sprint_challenges
FOR SELECT USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public insert sprint_challenges" ON public.sprint_challenges
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public update sprint_challenges" ON public.sprint_challenges
FOR UPDATE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public delete sprint_challenges" ON public.sprint_challenges
FOR DELETE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

-- =====================
-- app_settings
-- =====================
DROP POLICY IF EXISTS "Allow token insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow token update settings" ON public.app_settings;

CREATE POLICY "Allow token or public insert settings" ON public.app_settings
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

CREATE POLICY "Allow token or public update settings" ON public.app_settings
FOR UPDATE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR is_valid_assessor_token(COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), ''))
);

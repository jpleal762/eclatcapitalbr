
-- ============================================================
-- SECURITY FIX: assessor_tokens table
-- Drop dangerous public INSERT and UPDATE policies that allow
-- anyone to create admin tokens or escalate privileges.
-- Validation now goes through edge function using service role.
-- ============================================================

-- 1. Drop all public policies on assessor_tokens
DROP POLICY IF EXISTS "Allow public insert tokens" ON public.assessor_tokens;
DROP POLICY IF EXISTS "Allow public update tokens" ON public.assessor_tokens;
DROP POLICY IF EXISTS "Allow public read active tokens" ON public.assessor_tokens;

-- 2. Create a security-definer helper function that RLS policies
--    can use to check if a request token is valid without exposing
--    the assessor_tokens table to public SELECT.
CREATE OR REPLACE FUNCTION public.is_valid_assessor_token(t text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.assessor_tokens
    WHERE token = t
      AND is_active = true
  );
$$;

-- 3. Token-based policies for kpi_records
DROP POLICY IF EXISTS "Permitir leitura pública" ON public.kpi_records;
CREATE POLICY "Allow token read kpi_records"
  ON public.kpi_records FOR SELECT
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Permitir inserção pública" ON public.kpi_records;
CREATE POLICY "Allow token insert kpi_records"
  ON public.kpi_records FOR INSERT
  WITH CHECK (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Permitir atualização pública" ON public.kpi_records;
CREATE POLICY "Allow token update kpi_records"
  ON public.kpi_records FOR UPDATE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Permitir deleção pública" ON public.kpi_records;
CREATE POLICY "Allow token delete kpi_records"
  ON public.kpi_records FOR DELETE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

-- 4. kpi_snapshots
DROP POLICY IF EXISTS "Allow public read snapshots" ON public.kpi_snapshots;
CREATE POLICY "Allow token read kpi_snapshots"
  ON public.kpi_snapshots FOR SELECT
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public insert snapshots" ON public.kpi_snapshots;
CREATE POLICY "Allow token insert kpi_snapshots"
  ON public.kpi_snapshots FOR INSERT
  WITH CHECK (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public delete snapshots" ON public.kpi_snapshots;
CREATE POLICY "Allow token delete kpi_snapshots"
  ON public.kpi_snapshots FOR DELETE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

-- 5. sprint_challenges
DROP POLICY IF EXISTS "Allow public read sprint_challenges" ON public.sprint_challenges;
CREATE POLICY "Allow token read sprint_challenges"
  ON public.sprint_challenges FOR SELECT
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public insert sprint_challenges" ON public.sprint_challenges;
CREATE POLICY "Allow token insert sprint_challenges"
  ON public.sprint_challenges FOR INSERT
  WITH CHECK (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public update sprint_challenges" ON public.sprint_challenges;
CREATE POLICY "Allow token update sprint_challenges"
  ON public.sprint_challenges FOR UPDATE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public delete sprint_challenges" ON public.sprint_challenges;
CREATE POLICY "Allow token delete sprint_challenges"
  ON public.sprint_challenges FOR DELETE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

-- 6. sprint_snapshots
DROP POLICY IF EXISTS "Allow select on sprint_snapshots" ON public.sprint_snapshots;
CREATE POLICY "Allow token read sprint_snapshots"
  ON public.sprint_snapshots FOR SELECT
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow insert on sprint_snapshots" ON public.sprint_snapshots;
CREATE POLICY "Allow token insert sprint_snapshots"
  ON public.sprint_snapshots FOR INSERT
  WITH CHECK (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow delete on sprint_snapshots" ON public.sprint_snapshots;
CREATE POLICY "Allow token delete sprint_snapshots"
  ON public.sprint_snapshots FOR DELETE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

-- 7. app_settings - keep public read (non-sensitive config), restrict writes
DROP POLICY IF EXISTS "Allow public upsert settings" ON public.app_settings;
CREATE POLICY "Allow token insert settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

DROP POLICY IF EXISTS "Allow public update settings" ON public.app_settings;
CREATE POLICY "Allow token update settings"
  ON public.app_settings FOR UPDATE
  USING (
    public.is_valid_assessor_token(
      coalesce(current_setting('request.headers', true)::json->>'x-assessor-token', '')
    )
  );

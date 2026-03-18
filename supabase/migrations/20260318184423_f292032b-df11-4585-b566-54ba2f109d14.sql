
-- Fix 1: Add helper functions for assessor-scoped RLS

-- Returns the assessor_name linked to the current request token (null if no/invalid token)
CREATE OR REPLACE FUNCTION public.current_token_assessor_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT assessor_name
  FROM public.assessor_tokens
  WHERE token = COALESCE(
    (current_setting('request.headers', true)::json->>'x-assessor-token'),
    ''
  )
  AND is_active = true
  LIMIT 1;
$$;

-- Returns the role of the current request token (null if no/invalid token)
CREATE OR REPLACE FUNCTION public.current_token_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.assessor_tokens
  WHERE token = COALESCE(
    (current_setting('request.headers', true)::json->>'x-assessor-token'),
    ''
  )
  AND is_active = true
  LIMIT 1;
$$;

-- Fix 2: Update kpi_records SELECT policy to enforce assessor scoping for sócios
-- Allows: no token (admin direct access), admin-role token (all records), or own-assessor token
DROP POLICY IF EXISTS "Allow token or public read kpi_records" ON public.kpi_records;
CREATE POLICY "Allow token or public read kpi_records" ON public.kpi_records
FOR SELECT USING (
  -- No token = admin/direct access, allow all
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR
  -- Admin-role token = allow all
  public.current_token_role() = 'admin'
  OR
  -- Sócio token = only own records
  (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

-- Fix 3: Update kpi_records UPDATE policy with same scoping
DROP POLICY IF EXISTS "Allow token or public update kpi_records" ON public.kpi_records;
CREATE POLICY "Allow token or public update kpi_records" ON public.kpi_records
FOR UPDATE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR
  public.current_token_role() = 'admin'
  OR
  (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

-- Fix 4: Update kpi_records DELETE policy with same scoping
DROP POLICY IF EXISTS "Allow token or public delete kpi_records" ON public.kpi_records;
CREATE POLICY "Allow token or public delete kpi_records" ON public.kpi_records
FOR DELETE USING (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR
  public.current_token_role() = 'admin'
  OR
  (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

-- Fix 5: Update kpi_records INSERT policy with same scoping
DROP POLICY IF EXISTS "Allow token or public insert kpi_records" ON public.kpi_records;
CREATE POLICY "Allow token or public insert kpi_records" ON public.kpi_records
FOR INSERT WITH CHECK (
  COALESCE((current_setting('request.headers', true)::json->>'x-assessor-token'), '') = ''
  OR
  public.current_token_role() = 'admin'
  OR
  (public.current_token_role() = 'socio' AND assessor = public.current_token_assessor_name())
);

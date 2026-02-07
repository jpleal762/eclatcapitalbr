
-- 1. Add role column to assessor_tokens
ALTER TABLE public.assessor_tokens ADD COLUMN role text NOT NULL DEFAULT 'socio';

-- 2. Add last_production_update_at to assessor_tokens
ALTER TABLE public.assessor_tokens ADD COLUMN last_production_update_at timestamptz;

-- 3. Create app_settings table
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow public upsert settings" ON public.app_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update settings" ON public.app_settings
  FOR UPDATE USING (true);

-- Insert default open month
INSERT INTO public.app_settings (key, value) VALUES ('open_month', 'fev-26');

-- 4. Add audit columns to kpi_records
ALTER TABLE public.kpi_records ADD COLUMN created_by text;
ALTER TABLE public.kpi_records ADD COLUMN updated_by text;

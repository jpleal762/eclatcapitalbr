-- Corrigir search_path da função para resolver warning de segurança
CREATE OR REPLACE FUNCTION public.update_kpi_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
CREATE POLICY "Permitir atualização pública" ON public.kpi_records
  FOR UPDATE USING (true);
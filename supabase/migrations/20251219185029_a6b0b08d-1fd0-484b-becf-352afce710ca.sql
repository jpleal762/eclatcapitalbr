-- Criar tabela para armazenar os dados do Excel/KPI
CREATE TABLE public.kpi_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessor TEXT NOT NULL,
  categorias TEXT NOT NULL,
  status TEXT NOT NULL,
  monthly_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.kpi_records ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (qualquer pessoa pode ver/inserir/deletar)
CREATE POLICY "Permitir leitura pública" 
  ON public.kpi_records FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção pública" 
  ON public.kpi_records FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir deleção pública" 
  ON public.kpi_records FOR DELETE 
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_kpi_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kpi_records_updated_at
  BEFORE UPDATE ON public.kpi_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kpi_records_updated_at();
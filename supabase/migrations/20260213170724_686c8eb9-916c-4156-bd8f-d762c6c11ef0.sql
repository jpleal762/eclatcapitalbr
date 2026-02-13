
-- Create kpi_snapshots table for upload history
CREATE TABLE public.kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by text,
  snapshot_data jsonb NOT NULL,
  month text NOT NULL,
  record_count integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Allow public read snapshots"
ON public.kpi_snapshots FOR SELECT
USING (true);

-- Public insert
CREATE POLICY "Allow public insert snapshots"
ON public.kpi_snapshots FOR INSERT
WITH CHECK (true);

-- Public delete (for cleanup)
CREATE POLICY "Allow public delete snapshots"
ON public.kpi_snapshots FOR DELETE
USING (true);

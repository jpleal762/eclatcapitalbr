-- Table for storing sprint snapshots for evolution tracking
CREATE TABLE public.sprint_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(10) NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_sprint_snapshots_month ON public.sprint_snapshots(month);
CREATE INDEX idx_sprint_snapshots_created ON public.sprint_snapshots(created_at DESC);

-- Enable RLS
ALTER TABLE public.sprint_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required, same as kpi_records)
CREATE POLICY "Allow select on sprint_snapshots"
  ON public.sprint_snapshots FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on sprint_snapshots"
  ON public.sprint_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow delete on sprint_snapshots"
  ON public.sprint_snapshots FOR DELETE
  USING (true);
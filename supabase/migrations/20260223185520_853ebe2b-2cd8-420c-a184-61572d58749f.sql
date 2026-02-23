
CREATE TABLE public.sprint_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  assessor_name text NOT NULL,
  target_value numeric NOT NULL,
  deadline timestamptz NOT NULL,
  month text NOT NULL,
  created_by text,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.sprint_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read sprint_challenges"
ON public.sprint_challenges FOR SELECT USING (true);

CREATE POLICY "Allow public insert sprint_challenges"
ON public.sprint_challenges FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update sprint_challenges"
ON public.sprint_challenges FOR UPDATE USING (true);

CREATE POLICY "Allow public delete sprint_challenges"
ON public.sprint_challenges FOR DELETE USING (true);

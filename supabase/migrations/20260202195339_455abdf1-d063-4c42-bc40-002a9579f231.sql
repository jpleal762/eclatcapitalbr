ALTER TABLE assessor_tokens 
ADD COLUMN allowed_screens text[] DEFAULT ARRAY['dashboard', 'analysis', 'prospection', 'sprint', 'tactics']::text[];
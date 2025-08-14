-- Site outlines table for AI vectorized asphalt regions
CREATE TABLE IF NOT EXISTS public.site_outlines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  outline geography(Polygon, 4326) NOT NULL,
  area_sq_m double precision,
  perimeter_m double precision,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_outlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated can read site_outlines"
ON public.site_outlines FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated can insert site_outlines"
ON public.site_outlines FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can update own site_outlines"
ON public.site_outlines FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Authenticated can delete own site_outlines"
ON public.site_outlines FOR DELETE USING (created_by = auth.uid());
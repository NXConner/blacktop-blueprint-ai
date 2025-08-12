-- Enable RLS on the PostGIS spatial reference table flagged by the linter
-- This satisfies "RLS Disabled in Public" without breaking functionality
-- by allowing read-only access for authenticated users.

-- 1) Enable Row Level Security
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- 2) Create a read-only policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can read spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Authenticated users can read spatial_ref_sys"
ON public.spatial_ref_sys
FOR SELECT
TO authenticated
USING (true);

-- No INSERT/UPDATE/DELETE policies are provided, so those operations remain disallowed under RLS.
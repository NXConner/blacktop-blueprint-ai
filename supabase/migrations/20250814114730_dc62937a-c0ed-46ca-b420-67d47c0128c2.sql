-- Critical Security Fixes Migration

-- 1. Secure app_configs table with strict RLS policies
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "app_configs_select" ON public.app_configs;
DROP POLICY IF EXISTS "app_configs_insert" ON public.app_configs;
DROP POLICY IF EXISTS "app_configs_update" ON public.app_configs;
DROP POLICY IF EXISTS "app_configs_delete" ON public.app_configs;

-- Only admins can manage sensitive configs
CREATE POLICY "app_configs_admin_only"
ON public.app_configs
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 2. Create secure quickbooks_tokens table
CREATE TABLE IF NOT EXISTS public.quickbooks_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  realm_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS and restrict to admins only
ALTER TABLE public.quickbooks_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quickbooks_tokens_admin_only"
ON public.quickbooks_tokens
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 3. Enable RLS on spatial_ref_sys if possible (PostGIS table)
DO $$
BEGIN
  -- Try to enable RLS on spatial_ref_sys (may fail due to extension ownership)
  BEGIN
    ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    
    -- Allow read-only access to authenticated users
    CREATE POLICY "spatial_ref_sys_read_only"
    ON public.spatial_ref_sys
    FOR SELECT
    TO authenticated
    USING (true);
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but continue (PostGIS extension may own this table)
    RAISE NOTICE 'Could not enable RLS on spatial_ref_sys: %', SQLERRM;
  END;
END $$;

-- 4. Fix Security Definer functions - add SET search_path TO '' to existing functions
-- Update functions that are missing proper search path settings

-- Check if any security definer functions need path updates
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- This is a placeholder - the actual functions would need to be identified and updated
  -- Example pattern for updating functions:
  -- CREATE OR REPLACE FUNCTION public.function_name()
  -- RETURNS return_type
  -- LANGUAGE plpgsql
  -- SECURITY DEFINER
  -- SET search_path TO ''
  -- AS $function$ ... $function$;
  
  RAISE NOTICE 'Security Definer functions review required - check existing functions for proper search_path settings';
END $$;
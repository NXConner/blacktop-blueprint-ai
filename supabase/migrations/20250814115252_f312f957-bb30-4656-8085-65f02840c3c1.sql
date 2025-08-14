-- Security Fixes: Fix Function Search Paths for Security Definer Functions

-- Fix check_user_role function - Add SET search_path TO ''
CREATE OR REPLACE FUNCTION public.check_user_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = ANY(allowed_roles))
  );
$function$;

-- Fix is_admin_user function - Add SET search_path TO ''
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'admin'))
  );
$function$;

-- Fix calculate_compliance_score function - Add SET search_path TO ''
CREATE OR REPLACE FUNCTION public.calculate_compliance_score(emp_id uuid, start_date date, end_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  base_score INTEGER := 100;
  total_deductions INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(points_deducted), 0) INTO total_deductions
  FROM public.employee_violations ev
  WHERE ev.employee_id = emp_id AND ev.violation_date BETWEEN start_date AND end_date;
  
  RETURN GREATEST(0, base_score - total_deductions);
END;
$function$;

-- Fix check_rate_limit function - Add SET search_path TO ''
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_count integer;
  time_threshold timestamp with time zone;
BEGIN
  time_threshold := now() - (p_window_minutes || ' minutes')::interval;
  DELETE FROM public.rate_limits WHERE created_at < time_threshold;
  
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action AND created_at >= time_threshold;
  
  IF current_count < p_limit THEN
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) DO UPDATE SET count = public.rate_limits.count + 1, created_at = now();
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Fix create_violation function - Add SET search_path TO ''
CREATE OR REPLACE FUNCTION public.create_violation(emp_id uuid, rule_id uuid, description_text text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  violation_id UUID;
  points_to_deduct INTEGER;
BEGIN
  SELECT point_deduction INTO points_to_deduct FROM public.compliance_rules WHERE id = rule_id;
  INSERT INTO public.employee_violations (employee_id, rule_id, points_deducted, description, auto_generated)
  VALUES (emp_id, rule_id, points_to_deduct, description_text, true) RETURNING id INTO violation_id;
  RETURN violation_id;
END;
$function$;
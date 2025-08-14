-- Security Fixes: Fix remaining Security Definer functions search paths

-- Fix auto_disciplinary_action function
CREATE OR REPLACE FUNCTION public.auto_disciplinary_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_score INTEGER;
  action_type TEXT;
BEGIN
  -- Get current compliance score
  SELECT public.calculate_compliance_score(NEW.employee_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE)
  INTO current_score;
  
  -- Determine action based on score and violation severity
  IF current_score < 60 OR NEW.points_deducted >= 10 THEN
    action_type := 'suspension';
  ELSIF current_score < 70 OR NEW.points_deducted >= 5 THEN
    action_type := 'written_warning';
  ELSE
    action_type := 'warning';
  END IF;
  
  -- Insert disciplinary action
  INSERT INTO public.disciplinary_actions (
    employee_id, violation_id, action_type, auto_generated, description
  ) VALUES (
    NEW.employee_id, 
    NEW.id, 
    action_type, 
    true,
    'Auto-generated action for violation: ' || COALESCE(NEW.description, 'Compliance violation')
  );
  
  RETURN NEW;
END;
$function$;

-- Fix update_cost_tracking function
CREATE OR REPLACE FUNCTION public.update_cost_tracking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  tracking_record RECORD;
  period_types TEXT[] := ARRAY['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  period_type TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Update cost tracking for all period types
  FOREACH period_type IN ARRAY period_types
  LOOP
    -- Calculate period dates
    CASE period_type
      WHEN 'daily' THEN
        start_date := NEW.date_recorded;
        end_date := NEW.date_recorded;
      WHEN 'weekly' THEN
        start_date := date_trunc('week', NEW.date_recorded)::DATE;
        end_date := start_date + INTERVAL '6 days';
      WHEN 'monthly' THEN
        start_date := date_trunc('month', NEW.date_recorded)::DATE;
        end_date := (start_date + INTERVAL '1 month - 1 day')::DATE;
      WHEN 'quarterly' THEN
        start_date := date_trunc('quarter', NEW.date_recorded)::DATE;
        end_date := (start_date + INTERVAL '3 months - 1 day')::DATE;
      WHEN 'yearly' THEN
        start_date := date_trunc('year', NEW.date_recorded)::DATE;
        end_date := (start_date + INTERVAL '1 year - 1 day')::DATE;
    END CASE;
    
    -- Insert or update cost tracking record
    INSERT INTO public.cost_tracking (
      employee_id, project_id, period_type, period_start, period_end,
      positive_cost, negative_cost
    ) VALUES (
      NEW.employee_id, NEW.project_id, period_type, start_date, end_date,
      CASE WHEN NEW.type = 'positive' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'negative' THEN NEW.amount ELSE 0 END
    )
    ON CONFLICT (employee_id, project_id, period_type, period_start)
    DO UPDATE SET
      positive_cost = public.cost_tracking.positive_cost + CASE WHEN NEW.type = 'positive' THEN NEW.amount ELSE 0 END,
      negative_cost = public.cost_tracking.negative_cost + CASE WHEN NEW.type = 'negative' THEN NEW.amount ELSE 0 END,
      updated_at = now();
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Fix create_security_alert_from_event function
CREATE OR REPLACE FUNCTION public.create_security_alert_from_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.security_alerts (
        type,
        severity,
        status,
        description,
        event_id
    ) VALUES (
        NEW.type,
        NEW.severity,
        'new',
        NEW.description,
        NEW.id
    );
    RETURN NEW;
END;
$function$;
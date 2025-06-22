-- Enhanced security logging function with incident tracking
CREATE OR REPLACE FUNCTION public.log_security_incident(
  incident_type text,
  incident_details jsonb DEFAULT '{}'::jsonb,
  target_user_id uuid DEFAULT NULL,
  severity text DEFAULT 'medium',
  endpoint_name text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log to audit logs
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action,
    target_user_id,
    details,
    ip_address
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    CONCAT('SECURITY_', upper(incident_type)),
    target_user_id,
    jsonb_build_object(
      'severity', severity,
      'timestamp', now(),
      'endpoint', endpoint_name,
      'details', incident_details
    ),
    inet_client_addr()
  );
  
  -- Log to security incidents for high severity issues
  IF severity IN ('high', 'critical') THEN
    INSERT INTO public.security_incidents (
      incident_type,
      severity,
      details,
      user_id,
      ip_address,
      user_agent,
      endpoint
    ) VALUES (
      incident_type,
      severity,
      incident_details,
      target_user_id,
      inet_client_addr(),
      NULL, -- user_agent will be set by edge functions
      endpoint_name
    );
  END IF;
END;
$$;

-- Enhanced rate limiting function for edge functions
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  identifier_key text,
  endpoint_name text,
  max_requests integer DEFAULT 60,
  window_minutes integer DEFAULT 1
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.security_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Get current count for this identifier and endpoint
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.security_rate_limits
  WHERE identifier = identifier_key 
    AND endpoint = endpoint_name
    AND window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    -- Update blocked_until timestamp
    UPDATE public.security_rate_limits 
    SET blocked_until = now() + (window_minutes || ' minutes')::interval
    WHERE identifier = identifier_key AND endpoint = endpoint_name;
    
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO public.security_rate_limits (identifier, endpoint, request_count, window_start)
  VALUES (identifier_key, endpoint_name, 1, now())
  ON CONFLICT (identifier, endpoint) 
  DO UPDATE SET 
    request_count = security_rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;
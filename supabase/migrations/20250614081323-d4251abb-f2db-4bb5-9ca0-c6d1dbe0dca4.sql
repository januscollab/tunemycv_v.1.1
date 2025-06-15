-- Phase 1: Database Policy Cleanup and Security Enhancement (Fixed)

-- 1. Check and standardize existing policies
-- Remove redundant/conflicting policies safely
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploads;

-- 2. Create secure analysis view with proper RLS
DROP VIEW IF EXISTS public.analysis_logs_with_details;
CREATE VIEW public.analysis_logs_with_details 
WITH (security_barrier = true) AS
SELECT 
  al.id,
  al.user_id,
  al.analysis_result_id,
  al.cv_upload_id,
  al.job_description_upload_id,
  al.operation_type,
  al.status,
  al.openai_model,
  al.prompt_text,
  al.response_text,
  al.error_message,
  al.processing_time_ms,
  al.tokens_used,
  al.cost_estimate,
  al.created_at,
  ar.compatibility_score,
  ar.company_name,
  ar.job_title,
  p.first_name,
  p.last_name,
  p.email as user_email,
  cv.file_name as cv_file_name,
  jd.file_name as job_description_file_name,
  'completed' as entry_status
FROM public.analysis_logs al
LEFT JOIN public.analysis_results ar ON al.analysis_result_id = ar.id
LEFT JOIN public.profiles p ON al.user_id = p.id
LEFT JOIN public.uploads cv ON al.cv_upload_id = cv.id
LEFT JOIN public.uploads jd ON al.job_description_upload_id = jd.id
WHERE al.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin');

-- 3. Secure admin audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_admin_select" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_admin_select"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_system_insert" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_system_insert"
ON public.admin_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Secure analysis_logs table
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analysis_logs_user_select" ON public.analysis_logs;
CREATE POLICY "analysis_logs_user_select"
ON public.analysis_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "analysis_logs_system_insert" ON public.analysis_logs;
CREATE POLICY "analysis_logs_system_insert"
ON public.analysis_logs
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "analysis_logs_admin_select" ON public.analysis_logs;
CREATE POLICY "analysis_logs_admin_select"
ON public.analysis_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Enhanced security for site_settings (admin only)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_admin_all" ON public.site_settings;
CREATE POLICY "site_settings_admin_all"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Create enhanced rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_rate_limits_system_all" ON public.security_rate_limits;
CREATE POLICY "security_rate_limits_system_all"
ON public.security_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Create security incidents tracking table
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type text NOT NULL,
  severity text DEFAULT 'medium',
  details jsonb DEFAULT '{}',
  user_id uuid,
  ip_address inet,
  user_agent text,
  endpoint text,
  resolved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_incidents_admin_all" ON public.security_incidents;
CREATE POLICY "security_incidents_admin_all"
ON public.security_incidents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "security_incidents_system_insert" ON public.security_incidents;
CREATE POLICY "security_incidents_system_insert"
ON public.security_incidents
FOR INSERT
TO service_role
WITH CHECK (true);
-- Security Review: Critical Database RLS Policy Fixes (Corrected)

-- 1. Add RLS policies for user_id_sequence table (admin-only access)
ALTER TABLE public.user_id_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view user_id_sequence"
ON public.user_id_sequence
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user_id_sequence"
ON public.user_id_sequence
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Add RLS policies for adobe_usage_tracking table (admin-only access)
ALTER TABLE public.adobe_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view adobe usage tracking"
ON public.adobe_usage_tracking
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert adobe usage tracking"
ON public.adobe_usage_tracking
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "System can update adobe usage tracking"
ON public.adobe_usage_tracking
FOR UPDATE
TO service_role
USING (true);

-- 3. Add RLS policies for usage_alerts_sent table (admin-only access)
ALTER TABLE public.usage_alerts_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view usage alerts"
ON public.usage_alerts_sent
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert usage alerts"
ON public.usage_alerts_sent
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Add RLS policies for adobe_credentials table (admin-only access)
ALTER TABLE public.adobe_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view adobe credentials"
ON public.adobe_credentials
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage adobe credentials"
ON public.adobe_credentials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Add RLS policies for cover_letter_templates table (read-only for authenticated users)
ALTER TABLE public.cover_letter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active templates"
ON public.cover_letter_templates
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Only admins can manage templates"
ON public.cover_letter_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Add RLS policies for ai_prompts table (admin-only access)
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view ai prompts"
ON public.ai_prompts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage ai prompts"
ON public.ai_prompts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Add RLS policies for ai_prompt_versions table (admin-only access)
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view ai prompt versions"
ON public.ai_prompt_versions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage ai prompt versions"
ON public.ai_prompt_versions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Add RLS policies for adobe_extraction_logs table (admin-only access)
ALTER TABLE public.adobe_extraction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view adobe extraction logs"
ON public.adobe_extraction_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert adobe extraction logs"
ON public.adobe_extraction_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- 9. Drop and recreate uploads table policies for consistency
DROP POLICY IF EXISTS "Users can view own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.uploads;
DROP POLICY IF EXISTS "System can update processing status" ON public.uploads;

CREATE POLICY "Users can view own uploads"
ON public.uploads
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own uploads"
ON public.uploads
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own uploads"
ON public.uploads
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update processing status"
ON public.uploads
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Admins can view all uploads"
ON public.uploads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb,
  target_user_id uuid DEFAULT NULL,
  severity text DEFAULT 'info'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action,
    target_user_id,
    details,
    ip_address
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    CONCAT('SECURITY_', upper(event_type)),
    target_user_id,
    jsonb_build_object(
      'severity', severity,
      'timestamp', now(),
      'details', event_details
    ),
    inet_client_addr()
  );
END;
$$;
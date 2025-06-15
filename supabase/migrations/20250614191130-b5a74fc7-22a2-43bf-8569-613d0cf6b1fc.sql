-- Add archived status and archive metadata to tasks table
ALTER TABLE public.tasks 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN archived_by UUID REFERENCES auth.users(id),
ADD COLUMN archive_reason TEXT;

-- Create index for archived tasks
CREATE INDEX idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX idx_tasks_status_archived ON public.tasks(status, archived_at);

-- Update tasks table to better support archive workflow
UPDATE public.tasks 
SET archived_at = updated_at, archived_by = user_id 
WHERE status = 'completed';

-- Add function to archive completed tasks
CREATE OR REPLACE FUNCTION public.archive_completed_tasks(sprint_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive all completed tasks in the specified sprint
  UPDATE public.tasks 
  SET 
    archived_at = now(),
    archived_by = auth.uid(),
    archive_reason = 'Sprint completion'
  WHERE 
    sprint_id = sprint_id_param 
    AND status = 'completed' 
    AND archived_at IS NULL;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN archived_count;
END;
$$;
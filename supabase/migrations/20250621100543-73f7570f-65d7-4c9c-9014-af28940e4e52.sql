-- Add story_number column to tasks table for TUNE-000 numbering system
ALTER TABLE public.tasks 
ADD COLUMN story_number text UNIQUE;

-- Create index for story number lookups
CREATE INDEX idx_tasks_story_number ON public.tasks(story_number);

-- Create function to generate next story number
CREATE OR REPLACE FUNCTION public.generate_story_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number integer;
    story_number text;
BEGIN
    -- Get the highest existing story number
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(story_number FROM 'TUNE-(\d+)') AS integer)), 
        0
    ) + 1 
    INTO next_number
    FROM public.tasks 
    WHERE story_number IS NOT NULL 
    AND story_number ~ '^TUNE-\d+$';
    
    -- Format as TUNE-XXX with zero padding
    story_number := 'TUNE-' || LPAD(next_number::text, 3, '0');
    
    RETURN story_number;
END;
$$;

-- Create function to auto-assign story numbers to new tasks
CREATE OR REPLACE FUNCTION public.assign_story_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only assign story number if not already set
    IF NEW.story_number IS NULL THEN
        NEW.story_number := public.generate_story_number();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-assign story numbers
CREATE TRIGGER trigger_assign_story_number
    BEFORE INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_story_number();

-- Retroactively assign story numbers to existing tasks
DO $$
DECLARE
    task_record RECORD;
    counter integer := 1;
BEGIN
    FOR task_record IN 
        SELECT id FROM public.tasks 
        WHERE story_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        UPDATE public.tasks 
        SET story_number = 'TUNE-' || LPAD(counter::text, 3, '0')
        WHERE id = task_record.id;
        
        counter := counter + 1;
    END LOOP;
END;
$$;
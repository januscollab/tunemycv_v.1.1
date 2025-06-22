-- Fix story_number column ambiguity in tasks table
-- Make sure the story_number column has proper constraints and indexing
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_story_number_key;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_story_number_unique UNIQUE (story_number);

-- Ensure the trigger and function work properly
DROP TRIGGER IF EXISTS trigger_assign_story_number ON public.tasks;
CREATE TRIGGER trigger_assign_story_number
    BEFORE INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_story_number();

-- Recreate the Backlog - Future Enhancements sprint for all users who don't have it
INSERT INTO public.sprints (user_id, name, order_index, status, is_hidden)
SELECT 
    p.id as user_id,
    'Backlog - Future Enhancements' as name,
    999 as order_index, -- Always last
    'active' as status,
    false as is_hidden
FROM auth.users p
WHERE NOT EXISTS (
    SELECT 1 FROM public.sprints s 
    WHERE s.user_id = p.id 
    AND s.name = 'Backlog - Future Enhancements'
);
-- Remove the old "Backlog - Future Enhancements" sprints and move their tasks to Priority Sprint
DO $$
DECLARE
    backlog_sprint_record RECORD;
    priority_sprint_record RECORD;
BEGIN
    -- For each user, find their Priority Sprint and move all Backlog tasks to it
    FOR backlog_sprint_record IN 
        SELECT id, user_id 
        FROM public.sprints 
        WHERE name = 'Backlog - Future Enhancements'
    LOOP
        -- Find the Priority Sprint for this user
        SELECT id INTO priority_sprint_record
        FROM public.sprints 
        WHERE user_id = backlog_sprint_record.user_id 
        AND name = 'Priority Sprint'
        LIMIT 1;
        
        -- If Priority Sprint exists, move all tasks from Backlog to Priority Sprint
        IF priority_sprint_record IS NOT NULL THEN
            UPDATE public.tasks 
            SET sprint_id = priority_sprint_record.id
            WHERE sprint_id = backlog_sprint_record.id;
        END IF;
        
        -- Delete the Backlog sprint
        DELETE FROM public.sprints 
        WHERE id = backlog_sprint_record.id;
    END LOOP;
END;
$$;
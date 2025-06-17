-- Add story_info column to tasks table to store raw user input
ALTER TABLE public.tasks 
ADD COLUMN story_info text;

-- Add comment for clarity
COMMENT ON COLUMN public.tasks.story_info IS 'Raw user input before AI enhancement';
-- Fix adobe_debug_files table constraints to allow all file types
ALTER TABLE public.adobe_debug_files 
DROP CONSTRAINT IF EXISTS adobe_debug_files_file_type_check;

-- Add new constraint allowing all required file types
ALTER TABLE public.adobe_debug_files 
ADD CONSTRAINT adobe_debug_files_file_type_check 
CHECK (file_type IN ('zip', 'json', 'txt', 'text', 'pdf', 'docx', 'doc', 'plain'));

-- Update existing rows with 'plain' type to 'txt' for consistency
UPDATE public.adobe_debug_files 
SET file_type = 'txt' 
WHERE file_type = 'plain';
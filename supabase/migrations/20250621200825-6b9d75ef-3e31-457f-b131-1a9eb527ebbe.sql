
-- Fix PDF data storage by changing column type from bytea to text
-- This will allow proper base64 string storage instead of binary data

-- First, let's create a backup column and migrate existing data
ALTER TABLE public.analysis_results 
ADD COLUMN pdf_file_data_text TEXT;

-- Convert existing bytea data to base64 text format
UPDATE public.analysis_results 
SET pdf_file_data_text = encode(pdf_file_data, 'base64')
WHERE pdf_file_data IS NOT NULL;

-- Drop the old bytea column
ALTER TABLE public.analysis_results 
DROP COLUMN pdf_file_data;

-- Rename the new text column to the original name
ALTER TABLE public.analysis_results 
RENAME COLUMN pdf_file_data_text TO pdf_file_data;

-- Update the column to be TEXT type with proper constraints
ALTER TABLE public.analysis_results 
ALTER COLUMN pdf_file_data TYPE TEXT;

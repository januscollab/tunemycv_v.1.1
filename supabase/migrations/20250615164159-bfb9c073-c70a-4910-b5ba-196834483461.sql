-- Add OpenAI API key field to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN openai_api_key_encrypted text;

-- Add comment for documentation
COMMENT ON COLUMN public.site_settings.openai_api_key_encrypted IS 'Encrypted OpenAI API key for system-wide AI features like cover letter generation';
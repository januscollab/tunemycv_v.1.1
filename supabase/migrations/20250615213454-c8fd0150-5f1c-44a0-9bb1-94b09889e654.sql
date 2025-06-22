-- Add n8n analysis support and ensure JSON storage
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS analysis_type text DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS n8n_html_url text,
ADD COLUMN IF NOT EXISTS n8n_pdf_url text;

-- Update uploads table to ensure JSON is always stored
ALTER TABLE public.uploads 
ALTER COLUMN document_content_json SET DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.analysis_results.analysis_type IS 'Type of analysis: ai, n8n, or algorithmic';
COMMENT ON COLUMN public.analysis_results.n8n_html_url IS 'URL to n8n generated HTML report';
COMMENT ON COLUMN public.analysis_results.n8n_pdf_url IS 'URL to n8n generated PDF report';
COMMENT ON COLUMN public.uploads.document_content_json IS 'JSON master document used for RTE editing and n8n processing';
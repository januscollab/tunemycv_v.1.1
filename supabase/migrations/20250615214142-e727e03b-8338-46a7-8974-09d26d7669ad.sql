-- Add columns to store the downloaded PDF and HTML files from n8n
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS pdf_file_data bytea,
ADD COLUMN IF NOT EXISTS html_file_data text,
ADD COLUMN IF NOT EXISTS pdf_file_name text,
ADD COLUMN IF NOT EXISTS html_file_name text;

-- Add comments for clarity
COMMENT ON COLUMN public.analysis_results.pdf_file_data IS 'Binary data of the downloaded PDF file from n8n';
COMMENT ON COLUMN public.analysis_results.html_file_data IS 'HTML content downloaded from n8n';
COMMENT ON COLUMN public.analysis_results.pdf_file_name IS 'Original filename of the PDF file';
COMMENT ON COLUMN public.analysis_results.html_file_name IS 'Original filename of the HTML file';
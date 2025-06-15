-- Phase 3: Backfill existing CVs with proper JSON structure
-- Convert extracted_text to document_content_json for CVs that are missing it

CREATE OR REPLACE FUNCTION public.backfill_cv_json_content()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  cv_record RECORD;
  json_content JSONB;
  section_content TEXT;
BEGIN
  -- Process all CVs that have extracted_text but no document_content_json
  FOR cv_record IN 
    SELECT id, extracted_text, file_name
    FROM public.uploads 
    WHERE upload_type = 'cv' 
      AND extracted_text IS NOT NULL 
      AND (document_content_json IS NULL OR document_content_json = '{}')
  LOOP
    -- Create basic JSON structure from extracted text
    section_content := COALESCE(cv_record.extracted_text, '');
    
    -- Build JSON structure matching DocumentJson format
    json_content := jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid()::text,
          'type', 'paragraph',
          'content', section_content,
          'metadata', jsonb_build_object(
            'source', 'backfill_conversion',
            'converted_at', now()::text
          )
        )
      ),
      'metadata', jsonb_build_object(
        'title', cv_record.file_name,
        'source', 'extracted_text_conversion',
        'version', '1.0',
        'created_at', now()::text
      )
    );
    
    -- Update the record with the new JSON content
    UPDATE public.uploads 
    SET 
      document_content_json = json_content,
      updated_at = now()
    WHERE id = cv_record.id;
    
    -- Log the conversion
    RAISE NOTICE 'Converted CV: % (ID: %)', cv_record.file_name, cv_record.id;
  END LOOP;
  
  RAISE NOTICE 'Backfill completed successfully';
END;
$$;

-- Execute the backfill function
SELECT public.backfill_cv_json_content();

-- Drop the function after use (cleanup)
DROP FUNCTION public.backfill_cv_json_content();
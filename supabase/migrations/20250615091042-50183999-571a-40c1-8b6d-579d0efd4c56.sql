-- Add trigger to update updated_at when cover_letters content is modified
CREATE OR REPLACE FUNCTION public.update_cover_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cover_letters table
CREATE TRIGGER update_cover_letters_updated_at_trigger
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cover_letters_updated_at();
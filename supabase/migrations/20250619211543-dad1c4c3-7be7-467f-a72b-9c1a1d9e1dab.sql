-- Phase 1: Create interview_prep table and add bidirectional linkage fields

-- Create interview_prep table
CREATE TABLE public.interview_prep (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_result_id UUID REFERENCES public.analysis_results(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  content TEXT NOT NULL,
  generation_parameters JSONB DEFAULT '{}',
  regeneration_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_prep ENABLE ROW LEVEL SECURITY;

-- Create policies for interview_prep
CREATE POLICY "Users can view their own interview prep" 
ON public.interview_prep 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview prep" 
ON public.interview_prep 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview prep" 
ON public.interview_prep 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview prep" 
ON public.interview_prep 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add bidirectional linkage columns to analysis_results
ALTER TABLE public.analysis_results 
ADD COLUMN linked_cover_letter_id UUID REFERENCES public.cover_letters(id) ON DELETE SET NULL,
ADD COLUMN linked_interview_prep_id UUID REFERENCES public.interview_prep(id) ON DELETE SET NULL;

-- Add bidirectional linkage column to cover_letters
ALTER TABLE public.cover_letters 
ADD COLUMN linked_interview_prep_id UUID REFERENCES public.interview_prep(id) ON DELETE SET NULL;

-- Add bidirectional linkage column to interview_prep
ALTER TABLE public.interview_prep 
ADD COLUMN linked_cover_letter_id UUID REFERENCES public.cover_letters(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_prep_updated_at
BEFORE UPDATE ON public.interview_prep
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_interview_prep_user_id ON public.interview_prep(user_id);
CREATE INDEX idx_interview_prep_analysis_result_id ON public.interview_prep(analysis_result_id);
CREATE INDEX idx_analysis_results_linked_cover_letter_id ON public.analysis_results(linked_cover_letter_id);
CREATE INDEX idx_analysis_results_linked_interview_prep_id ON public.analysis_results(linked_interview_prep_id);
CREATE INDEX idx_cover_letters_linked_interview_prep_id ON public.cover_letters(linked_interview_prep_id);
CREATE INDEX idx_interview_prep_linked_cover_letter_id ON public.interview_prep(linked_cover_letter_id);
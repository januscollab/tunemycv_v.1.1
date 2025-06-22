-- Create storage bucket for task images
INSERT INTO storage.buckets (id, name, public) VALUES ('task-images', 'task-images', true);

-- Create policies for task images
CREATE POLICY "Users can view task images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-images');

CREATE POLICY "Users can upload task images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their task images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their task images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add images column to tasks table
ALTER TABLE public.tasks ADD COLUMN images text[] DEFAULT '{}';

-- Create task_images table for better organization
CREATE TABLE public.task_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for task_images
ALTER TABLE public.task_images ENABLE ROW LEVEL SECURITY;

-- Create policies for task_images
CREATE POLICY "Users can view task images they have access to"
ON public.task_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload images to their tasks"
ON public.task_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images from their tasks"
ON public.task_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id AND t.user_id = auth.uid()
  )
);
-- Create sprints table
CREATE TABLE public.sprints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  tags text[],
  status text NOT NULL DEFAULT 'todo',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create execution_logs table
CREATE TABLE public.execution_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  prompt_sent text NOT NULL,
  ai_response text,
  execution_date timestamp with time zone NOT NULL DEFAULT now(),
  model_used text DEFAULT 'gpt-4'
);

-- Create user_devsuite_settings table
CREATE TABLE public.user_devsuite_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  openai_api_key_encrypted text,
  preferred_model text DEFAULT 'gpt-4',
  story_generation_enabled boolean DEFAULT true,
  show_priority_sprint boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devsuite_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sprints
CREATE POLICY "Users can view their own sprints" 
ON public.sprints FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sprints" 
ON public.sprints FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sprints" 
ON public.sprints FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sprints" 
ON public.sprints FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for execution_logs
CREATE POLICY "Users can view their own execution logs" 
ON public.execution_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own execution logs" 
ON public.execution_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_devsuite_settings
CREATE POLICY "Users can view their own devsuite settings" 
ON public.user_devsuite_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devsuite settings" 
ON public.user_devsuite_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devsuite settings" 
ON public.user_devsuite_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_devsuite_settings_updated_at
  BEFORE UPDATE ON public.user_devsuite_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sprints for new users
CREATE OR REPLACE FUNCTION public.create_default_sprints()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create default sprints for new user
  INSERT INTO public.sprints (user_id, name, order_index) VALUES
    (NEW.id, 'Priority', 0),
    (NEW.id, 'Sprint 2', 1),
    (NEW.id, 'Backlog', 2);
  
  -- Create default settings
  INSERT INTO public.user_devsuite_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create default sprints on user signup
CREATE TRIGGER on_auth_user_created_devsuite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_sprints();

-- This SQL will need to be run manually in the Supabase dashboard
-- Create the classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  instructor TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day, time)
);

-- Create the class_confirmations table
CREATE TABLE IF NOT EXISTS public.class_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id TEXT REFERENCES public.classes NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Add RLS policies
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read classes
CREATE POLICY "Anyone can read classes" 
  ON public.classes FOR SELECT 
  USING (true);

-- Only authenticated users can read confirmations
CREATE POLICY "Authenticated users can read confirmations" 
  ON public.class_confirmations FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Users can only create/delete their own confirmations
CREATE POLICY "Users can confirm classes for themselves" 
  ON public.class_confirmations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own confirmations" 
  ON public.class_confirmations FOR DELETE 
  USING (auth.uid() = user_id);

-- Initial class data
INSERT INTO public.classes (id, day, time, location, instructor, max_participants)
VALUES
  ('m1', 'Segunda', '8:30', 'Quadra Central', 'João Silva', 16),
  ('m2', 'Segunda', '17:00', 'Quadra Central', 'Maria Oliveira', 16),
  ('m3', 'Segunda', '18:30', 'Quadra Central', 'Pedro Santos', 16),
  ('m4', 'Segunda', '20:00', 'Quadra Lateral', 'Carlos Ferreira', 12),
  
  ('t1', 'Terça', '6:30', 'Quadra Lateral', 'Ana Costa', 12),
  ('t2', 'Terça', '8:00', 'Quadra Central', 'João Silva', 16),
  ('t3', 'Terça', '12:00', 'Quadra Central', 'Pedro Santos', 16),
  ('t4', 'Terça', '17:00', 'Quadra Central', 'Maria Oliveira', 16),
  ('t5', 'Terça', '18:30', 'Quadra Central', 'Carlos Ferreira', 16),
  ('t6', 'Terça', '20:00', 'Quadra Lateral', 'Ana Costa', 12),
  
  ('w1', 'Quarta', '8:30', 'Quadra Central', 'João Silva', 16),
  ('w2', 'Quarta', '17:00', 'Quadra Central', 'Maria Oliveira', 16),
  ('w3', 'Quarta', '18:30', 'Quadra Central', 'Pedro Santos', 16),
  ('w4', 'Quarta', '20:00', 'Quadra Lateral', 'Carlos Ferreira', 12),
  
  ('th1', 'Quinta', '6:30', 'Quadra Lateral', 'Ana Costa', 12),
  ('th2', 'Quinta', '8:00', 'Quadra Central', 'João Silva', 16),
  ('th3', 'Quinta', '12:00', 'Quadra Central', 'Pedro Santos', 16),
  ('th4', 'Quinta', '17:00', 'Quadra Central', 'Maria Oliveira', 16),
  ('th5', 'Quinta', '18:30', 'Quadra Central', 'Carlos Ferreira', 16),
  ('th6', 'Quinta', '20:00', 'Quadra Lateral', 'Ana Costa', 12)
ON CONFLICT (day, time) DO NOTHING;

-- Function to count confirmations for a class
CREATE OR REPLACE FUNCTION public.get_class_confirmation_count(class_id TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.class_confirmations
  WHERE class_id = $1;
$$;

-- Function to check if a user has confirmed a class
CREATE OR REPLACE FUNCTION public.has_user_confirmed_class(user_id UUID, class_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_confirmations
    WHERE user_id = $1 AND class_id = $2
  );
$$;

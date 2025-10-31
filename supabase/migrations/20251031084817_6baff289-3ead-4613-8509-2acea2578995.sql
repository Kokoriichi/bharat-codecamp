-- Create cheatsheets table
CREATE TABLE IF NOT EXISTS public.cheatsheets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  language text NOT NULL DEFAULT 'python',
  url text NOT NULL,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cheatsheets ENABLE ROW LEVEL SECURITY;

-- Anyone can view cheatsheets
CREATE POLICY "Anyone can view cheatsheets"
ON public.cheatsheets
FOR SELECT
USING (true);
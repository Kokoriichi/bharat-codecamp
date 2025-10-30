-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  daily_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_notes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  markdown_notes TEXT,
  cheatsheet_url TEXT,
  difficulty TEXT DEFAULT 'beginner',
  language TEXT DEFAULT 'python',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons (public read)
CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_notes table
CREATE TABLE public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notes
CREATE POLICY "Users can view their own notes"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.user_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_codes table
CREATE TABLE public.user_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_codes
CREATE POLICY "Users can view their own codes"
  ON public.user_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own codes"
  ON public.user_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own codes"
  ON public.user_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own codes"
  ON public.user_codes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_codes_updated_at
  BEFORE UPDATE ON public.user_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample lessons (CodeWithHarry Python tutorials)
INSERT INTO public.lessons (title, description, video_url, markdown_notes, difficulty, language, order_index, thumbnail_url) VALUES
('Python Tutorial for Beginners', 'Learn Python basics - variables, data types, and operators', 'https://www.youtube.com/embed/7wnove7K-ZQ', '# Python Basics\n\n## Variables\nVariables store data values.\n\n```python\nname = "Bharat"\nage = 18\n```\n\n## Data Types\n- int: Integer numbers\n- float: Decimal numbers\n- str: Text strings\n- bool: True/False', 'beginner', 'python', 1, 'https://img.youtube.com/vi/7wnove7K-ZQ/maxresdefault.jpg'),

('Python Functions', 'Master functions, parameters, and return values in Python', 'https://www.youtube.com/embed/BVfCWuca9nw', '# Python Functions\n\n## Defining Functions\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Bharat"))\n```\n\n## Parameters\n- Positional parameters\n- Keyword parameters\n- Default parameters', 'beginner', 'python', 2, 'https://img.youtube.com/vi/BVfCWuca9nw/maxresdefault.jpg'),

('Python Lists & Loops', 'Learn about lists, for loops, and while loops', 'https://www.youtube.com/embed/gCCVsvgR2KU', '# Lists and Loops\n\n## Lists\n```python\nfruits = ["apple", "banana", "cherry"]\nprint(fruits[0])  # apple\n```\n\n## For Loop\n```python\nfor fruit in fruits:\n    print(fruit)\n```\n\n## While Loop\n```python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n```', 'beginner', 'python', 3, 'https://img.youtube.com/vi/gCCVsvgR2KU/maxresdefault.jpg');

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_active DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_active_date, daily_streak INTO last_active, current_streak
  FROM public.profiles
  WHERE id = user_uuid;

  IF last_active = CURRENT_DATE THEN
    -- Already active today, no change
    RETURN;
  ELSIF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Active yesterday, increment streak
    UPDATE public.profiles
    SET daily_streak = current_streak + 1,
        last_active_date = CURRENT_DATE
    WHERE id = user_uuid;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.profiles
    SET daily_streak = 1,
        last_active_date = CURRENT_DATE
    WHERE id = user_uuid;
  END IF;
END;
$$;
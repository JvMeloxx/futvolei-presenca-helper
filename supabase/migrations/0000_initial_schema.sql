-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table complementary to auth.users
CREATE TABLE profiles (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  preferred_days text[],
  preferred_times text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow running the script multiple times safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create classes table
CREATE TABLE classes (
  id uuid default uuid_generate_v4() primary key,
  day text not null,
  time text not null,
  location text not null,
  instructor text not null,
  max_participants integer not null default 12,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes are viewable by everyone."
  ON classes FOR SELECT USING (true);
  
CREATE POLICY "Admins can insert classes."
  ON classes FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update classes."
  ON classes FOR UPDATE USING (true);

CREATE POLICY "Admins can delete classes."
  ON classes FOR DELETE USING (true);

-- Create class_confirmations table
CREATE TABLE class_confirmations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid REFERENCES profiles(id) on delete cascade not null,
  class_id uuid REFERENCES classes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id, class_id)
);

ALTER TABLE class_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view confirmations."
  ON class_confirmations FOR SELECT USING (true);

CREATE POLICY "Users can confirm their own presence."
  ON class_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own confirmation."
  ON class_confirmations FOR DELETE USING (auth.uid() = user_id);

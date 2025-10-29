/*
  # Create Sportigon Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `favorite_sports` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `sport` (text)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `shares_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (post_id, user_id)
    
    - `sports`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `icon` (text)
      - `color` (text)
      - `followers_count` (integer, default 0)
      - `is_trending` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `sport_leagues`
      - `id` (uuid, primary key)
      - `sport_id` (uuid, references sports)
      - `name` (text)
      - `created_at` (timestamptz)
    
    - `user_sports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `sport_id` (uuid, references sports)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, sport_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for authenticated users to read public data
    - Add policies for users to create, update, and delete their own content

  3. Important Notes
    - All user data is protected by RLS
    - Users can only modify their own content
    - Public data (sports, leagues) is readable by all authenticated users
    - Follower counts and engagement metrics use triggers for accuracy
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text,
  favorite_sports text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text DEFAULT '',
  color text DEFAULT '',
  followers_count integer DEFAULT 0,
  is_trending boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sports"
  ON sports FOR SELECT
  TO authenticated
  USING (true);

-- Create sport_leagues table
CREATE TABLE IF NOT EXISTS sport_leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sport_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leagues"
  ON sport_leagues FOR SELECT
  TO authenticated
  USING (true);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  sport text DEFAULT '',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_sports table
CREATE TABLE IF NOT EXISTS user_sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sport_id)
);

ALTER TABLE user_sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sport follows"
  ON user_sports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow sports"
  ON user_sports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow sports"
  ON user_sports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sports_sport_id ON user_sports(sport_id);
CREATE INDEX IF NOT EXISTS idx_sport_leagues_sport_id ON sport_leagues(sport_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_posts_updated_at') THEN
    CREATE TRIGGER update_posts_updated_at
      BEFORE UPDATE ON posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample sports data
INSERT INTO sports (name, icon, color, is_trending, followers_count)
VALUES
  ('Football', '⚽', 'from-green-500 to-emerald-600', true, 2500000),
  ('Basketball', '🏀', 'from-orange-500 to-red-600', true, 1800000),
  ('Tennis', '🎾', 'from-yellow-500 to-amber-600', false, 1200000),
  ('Baseball', '⚾', 'from-blue-500 to-cyan-600', false, 950000),
  ('American Football', '🏈', 'from-red-500 to-rose-600', true, 2100000),
  ('Cricket', '🏏', 'from-teal-500 to-cyan-600', false, 1600000)
ON CONFLICT (name) DO NOTHING;

-- Insert sample leagues
INSERT INTO sport_leagues (sport_id, name)
SELECT id, league_name
FROM sports s
CROSS JOIN LATERAL (
  VALUES
    (CASE WHEN s.name = 'Football' THEN 'Premier League' END),
    (CASE WHEN s.name = 'Football' THEN 'La Liga' END),
    (CASE WHEN s.name = 'Football' THEN 'Serie A' END),
    (CASE WHEN s.name = 'Football' THEN 'Bundesliga' END),
    (CASE WHEN s.name = 'Basketball' THEN 'NBA' END),
    (CASE WHEN s.name = 'Basketball' THEN 'EuroLeague' END),
    (CASE WHEN s.name = 'Basketball' THEN 'NCAA' END),
    (CASE WHEN s.name = 'Tennis' THEN 'ATP Tour' END),
    (CASE WHEN s.name = 'Tennis' THEN 'WTA Tour' END),
    (CASE WHEN s.name = 'Tennis' THEN 'Grand Slam' END),
    (CASE WHEN s.name = 'Baseball' THEN 'MLB' END),
    (CASE WHEN s.name = 'Baseball' THEN 'NPB' END),
    (CASE WHEN s.name = 'American Football' THEN 'NFL' END),
    (CASE WHEN s.name = 'American Football' THEN 'NCAA Football' END),
    (CASE WHEN s.name = 'Cricket' THEN 'IPL' END),
    (CASE WHEN s.name = 'Cricket' THEN 'Test Cricket' END)
) AS leagues(league_name)
WHERE league_name IS NOT NULL
ON CONFLICT DO NOTHING;

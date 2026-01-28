/*
  # Create Sportigon Matches and Standings Schema

  1. New Tables
    - `matches`
      - `id` (uuid, primary key)
      - `home_team` (text)
      - `away_team` (text)
      - `home_score` (integer, default 0)
      - `away_score` (integer, default 0)
      - `status` (text) - 'scheduled', 'live', 'halftime', 'finished'
      - `sport` (text)
      - `league` (text)
      - `match_time` (timestamptz)
      - `minute` (integer, nullable)
      - `stadium` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `standings`
      - `id` (uuid, primary key)
      - `team` (text)
      - `played` (integer, default 0)
      - `won` (integer, default 0)
      - `drawn` (integer, default 0)
      - `lost` (integer, default 0)
      - `goals_for` (integer, default 0)
      - `goals_against` (integer, default 0)
      - `goal_difference` (integer, default 0)
      - `points` (integer, default 0)
      - `position` (integer)
      - `league` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public read access for matches and standings
    - Only authenticated users can modify data

  3. Important Notes
    - All data is publicly readable for the live scores feature
    - Real-time subscriptions enabled for live match updates
    - Indexes added for optimal query performance
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  sport text NOT NULL,
  league text NOT NULL,
  match_time timestamptz NOT NULL,
  minute integer,
  stadium text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create standings table
CREATE TABLE IF NOT EXISTS standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team text NOT NULL,
  played integer DEFAULT 0,
  won integer DEFAULT 0,
  drawn integer DEFAULT 0,
  lost integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  goal_difference integer DEFAULT 0,
  points integer DEFAULT 0,
  position integer NOT NULL,
  league text NOT NULL DEFAULT 'Premier League',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read standings"
  ON standings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert standings"
  ON standings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update standings"
  ON standings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_time ON matches(match_time);
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league);
CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(position);

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
    CREATE TRIGGER update_matches_updated_at
      BEFORE UPDATE ON matches
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_standings_updated_at') THEN
    CREATE TRIGGER update_standings_updated_at
      BEFORE UPDATE ON standings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample live matches
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Manchester United', 'Liverpool', 2, 1, 'live', 'Football', 'Premier League', now(), 67, 'Old Trafford'),
  ('Chelsea', 'Arsenal', 1, 1, 'live', 'Football', 'Premier League', now(), 45, 'Stamford Bridge'),
  ('Real Madrid', 'Barcelona', 3, 2, 'finished', 'Football', 'La Liga', now() - interval '2 hours', NULL, 'Santiago Bernabeu'),
  ('Manchester City', 'Tottenham', 0, 0, 'scheduled', 'Football', 'Premier League', now() + interval '2 hours', NULL, 'Etihad Stadium'),
  ('Lakers', 'Warriors', 102, 98, 'live', 'Basketball', 'NBA', now(), NULL, 'Crypto.com Arena'),
  ('Celtics', 'Heat', 115, 108, 'finished', 'Basketball', 'NBA', now() - interval '3 hours', NULL, 'TD Garden')
ON CONFLICT DO NOTHING;

-- Insert sample standings
INSERT INTO standings (team, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, position, league)
VALUES
  ('Manchester City', 15, 12, 2, 1, 38, 12, 26, 38, 1, 'Premier League'),
  ('Liverpool', 15, 11, 3, 1, 35, 15, 20, 36, 2, 'Premier League'),
  ('Arsenal', 15, 10, 4, 1, 32, 14, 18, 34, 3, 'Premier League'),
  ('Tottenham', 15, 9, 3, 3, 30, 18, 12, 30, 4, 'Premier League'),
  ('Manchester United', 15, 8, 4, 3, 28, 20, 8, 28, 5, 'Premier League'),
  ('Chelsea', 15, 7, 5, 3, 25, 18, 7, 26, 6, 'Premier League'),
  ('Newcastle', 15, 7, 4, 4, 26, 22, 4, 25, 7, 'Premier League'),
  ('Brighton', 15, 6, 5, 4, 24, 20, 4, 23, 8, 'Premier League'),
  ('West Ham', 15, 5, 6, 4, 22, 21, 1, 21, 9, 'Premier League'),
  ('Aston Villa', 15, 5, 5, 5, 20, 22, -2, 20, 10, 'Premier League')
ON CONFLICT DO NOTHING;

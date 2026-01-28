/*
  # Enhanced Sportigon Sample Data
  
  This migration adds comprehensive sample data for all supported sports:
  - Football (Soccer)
  - Basketball
  - Tennis
  - Cricket
  - Baseball
  - Hockey
  
  Includes matches in various states (live, scheduled, finished) and 
  standings for Premier League.
*/

-- Clear existing sample data (optional, for fresh start)
TRUNCATE TABLE matches, standings RESTART IDENTITY CASCADE;

-- ============================================================================
-- FOOTBALL MATCHES
-- ============================================================================

-- Premier League (Live and Finished)
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Manchester United', 'Liverpool', 2, 1, 'live', 'Football', 'Premier League', now(), 67, 'Old Trafford'),
  ('Chelsea', 'Arsenal', 1, 1, 'live', 'Football', 'Premier League', now(), 82, 'Stamford Bridge'),
  ('Manchester City', 'Tottenham', 3, 2, 'finished', 'Football', 'Premier League', now() - interval '2 hours', NULL, 'Etihad Stadium'),
  ('Newcastle', 'Brighton', 2, 0, 'finished', 'Football', 'Premier League', now() - interval '3 hours', NULL, 'St James Park'),
  ('Aston Villa', 'West Ham', 0, 0, 'scheduled', 'Football', 'Premier League', now() + interval '2 hours', NULL, 'Villa Park'),
  ('Wolverhampton', 'Everton', 0, 0, 'scheduled', 'Football', 'Premier League', now() + interval '4 hours', NULL, 'Molineux Stadium');

-- La Liga
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Real Madrid', 'Barcelona', 2, 2, 'live', 'Football', 'La Liga', now(), 55, 'Santiago Bernabeu'),
  ('Atletico Madrid', 'Sevilla', 1, 0, 'finished', 'Football', 'La Liga', now() - interval '1 hour', NULL, 'Wanda Metropolitano'),
  ('Valencia', 'Villarreal', 0, 0, 'scheduled', 'Football', 'La Liga', now() + interval '3 hours', NULL, 'Mestalla'),
  ('Real Sociedad', 'Athletic Bilbao', 0, 0, 'scheduled', 'Football', 'La Liga', now() + interval '5 hours', NULL, 'Anoeta Stadium');

-- Bundesliga
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Bayern Munich', 'Borussia Dortmund', 3, 1, 'finished', 'Football', 'Bundesliga', now() - interval '4 hours', NULL, 'Allianz Arena'),
  ('RB Leipzig', 'Bayer Leverkusen', 0, 0, 'scheduled', 'Football', 'Bundesliga', now() + interval '6 hours', NULL, 'Red Bull Arena');

-- Serie A
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Juventus', 'Inter Milan', 1, 1, 'live', 'Football', 'Serie A', now(), 38, 'Allianz Stadium'),
  ('AC Milan', 'Napoli', 2, 1, 'finished', 'Football', 'Serie A', now() - interval '2 hours', NULL, 'San Siro');

-- ============================================================================
-- BASKETBALL MATCHES
-- ============================================================================

-- NBA
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Lakers', 'Warriors', 102, 98, 'live', 'Basketball', 'NBA', now(), NULL, 'Crypto.com Arena'),
  ('Celtics', 'Heat', 115, 108, 'finished', 'Basketball', 'NBA', now() - interval '3 hours', NULL, 'TD Garden'),
  ('Bucks', 'Nets', 0, 0, 'scheduled', 'Basketball', 'NBA', now() + interval '4 hours', NULL, 'Fiserv Forum'),
  ('Suns', 'Mavericks', 95, 92, 'finished', 'Basketball', 'NBA', now() - interval '5 hours', NULL, 'Footprint Center'),
  ('76ers', 'Knicks', 0, 0, 'scheduled', 'Basketball', 'NBA', now() + interval '6 hours', NULL, 'Wells Fargo Center');

-- EuroLeague
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Real Madrid', 'Barcelona', 78, 75, 'live', 'Basketball', 'EuroLeague', now(), NULL, 'WiZink Center'),
  ('Olympiacos', 'Panathinaikos', 82, 79, 'finished', 'Basketball', 'EuroLeague', now() - interval '2 hours', NULL, 'Peace and Friendship Stadium');

-- ============================================================================
-- TENNIS MATCHES
-- ============================================================================

-- ATP Tour
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Djokovic', 'Alcaraz', 2, 1, 'live', 'Tennis', 'ATP Tour', now(), NULL, 'Centre Court'),
  ('Medvedev', 'Sinner', 1, 2, 'finished', 'Tennis', 'ATP Tour', now() - interval '1 hour', NULL, 'Court 1'),
  ('Rublev', 'Tsitsipas', 0, 0, 'scheduled', 'Tennis', 'ATP Tour', now() + interval '2 hours', NULL, 'Court 2');

-- WTA Tour
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Swiatek', 'Sabalenka', 1, 1, 'live', 'Tennis', 'WTA Tour', now(), NULL, 'Centre Court'),
  ('Rybakina', 'Gauff', 2, 0, 'finished', 'Tennis', 'WTA Tour', now() - interval '2 hours', NULL, 'Court 1');

-- ============================================================================
-- CRICKET MATCHES
-- ============================================================================

-- Test Series
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('England', 'Australia', 287, 195, 'live', 'Cricket', 'Test Series', now(), NULL, 'Lords Cricket Ground'),
  ('India', 'South Africa', 412, 298, 'finished', 'Cricket', 'Test Series', now() - interval '4 hours', NULL, 'Eden Gardens');

-- IPL
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Mumbai Indians', 'Chennai Super Kings', 178, 142, 'finished', 'Cricket', 'IPL', now() - interval '3 hours', NULL, 'Wankhede Stadium'),
  ('Royal Challengers', 'Kolkata Knight Riders', 0, 0, 'scheduled', 'Cricket', 'IPL', now() + interval '5 hours', NULL, 'M. Chinnaswamy Stadium');

-- ============================================================================
-- BASEBALL MATCHES
-- ============================================================================

-- MLB
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Yankees', 'Red Sox', 4, 3, 'live', 'Baseball', 'MLB', now(), NULL, 'Yankee Stadium'),
  ('Dodgers', 'Giants', 5, 2, 'finished', 'Baseball', 'MLB', now() - interval '4 hours', NULL, 'Dodger Stadium'),
  ('Cubs', 'Cardinals', 0, 0, 'scheduled', 'Baseball', 'MLB', now() + interval '3 hours', NULL, 'Wrigley Field'),
  ('Astros', 'Rangers', 0, 0, 'scheduled', 'Baseball', 'MLB', now() + interval '7 hours', NULL, 'Minute Maid Park');

-- ============================================================================
-- HOCKEY MATCHES
-- ============================================================================

-- NHL
INSERT INTO matches (home_team, away_team, home_score, away_score, status, sport, league, match_time, minute, stadium)
VALUES
  ('Maple Leafs', 'Canadiens', 3, 2, 'live', 'Hockey', 'NHL', now(), NULL, 'Scotiabank Arena'),
  ('Bruins', 'Rangers', 4, 1, 'finished', 'Hockey', 'NHL', now() - interval '2 hours', NULL, 'TD Garden'),
  ('Penguins', 'Capitals', 0, 0, 'scheduled', 'Hockey', 'NHL', now() + interval '4 hours', NULL, 'PPG Paints Arena'),
  ('Oilers', 'Flames', 0, 0, 'scheduled', 'Hockey', 'NHL', now() + interval '8 hours', NULL, 'Rogers Place');

-- ============================================================================
-- STANDINGS DATA (Premier League)
-- ============================================================================

INSERT INTO standings (team, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, position, league)
VALUES
  ('Manchester City', 16, 12, 3, 1, 41, 15, 26, 39, 1, 'Premier League'),
  ('Liverpool', 16, 12, 2, 2, 38, 16, 22, 38, 2, 'Premier League'),
  ('Arsenal', 16, 11, 3, 2, 35, 16, 19, 36, 3, 'Premier League'),
  ('Tottenham', 16, 10, 3, 3, 33, 20, 13, 33, 4, 'Premier League'),
  ('Manchester United', 16, 9, 4, 3, 31, 22, 9, 31, 5, 'Premier League'),
  ('Chelsea', 16, 8, 5, 3, 28, 20, 8, 29, 6, 'Premier League'),
  ('Newcastle', 16, 8, 4, 4, 29, 24, 5, 28, 7, 'Premier League'),
  ('Brighton', 16, 7, 5, 4, 27, 22, 5, 26, 8, 'Premier League'),
  ('West Ham', 16, 6, 6, 4, 25, 23, 2, 24, 9, 'Premier League'),
  ('Aston Villa', 16, 6, 5, 5, 23, 24, -1, 23, 10, 'Premier League'),
  ('Brentford', 16, 6, 4, 6, 24, 26, -2, 22, 11, 'Premier League'),
  ('Fulham', 16, 5, 6, 5, 22, 24, -2, 21, 12, 'Premier League'),
  ('Wolverhampton', 16, 5, 5, 6, 20, 24, -4, 20, 13, 'Premier League'),
  ('Crystal Palace', 16, 4, 6, 6, 18, 22, -4, 18, 14, 'Premier League'),
  ('Everton', 16, 4, 5, 7, 17, 25, -8, 17, 15, 'Premier League'),
  ('Nottingham Forest', 16, 3, 6, 7, 16, 26, -10, 15, 16, 'Premier League'),
  ('Bournemouth', 16, 3, 5, 8, 15, 28, -13, 14, 17, 'Premier League'),
  ('Luton Town', 16, 2, 5, 9, 14, 30, -16, 11, 18, 'Premier League'),
  ('Sheffield United', 16, 2, 3, 11, 12, 32, -20, 9, 19, 'Premier League'),
  ('Burnley', 16, 1, 4, 11, 10, 35, -25, 7, 20, 'Premier League');

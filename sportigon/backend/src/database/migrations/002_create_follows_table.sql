-- Migration: 002_create_follows_table
-- Description: Create follows table for user relationships

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't follow the same person twice
  UNIQUE(follower_id, following_id),
  
  -- Ensure a user can't follow themselves
  CHECK (follower_id != following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(follower_id, following_id);

-- Create function to update follower counts cache
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate cache for both users
    -- This would be handled by the application layer in Redis
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to handle follow/unfollow events
CREATE TRIGGER update_follower_counts_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Insert sample follow relationships
INSERT INTO follows (follower_id, following_id) 
SELECT 
  (SELECT id FROM profiles WHERE username = 'sportsfan'),
  (SELECT id FROM profiles WHERE username = 'admin')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Insert more sample relationships for testing
INSERT INTO follows (follower_id, following_id) 
VALUES 
  ((SELECT id FROM profiles WHERE username = 'admin'), (SELECT id FROM profiles WHERE username = 'sportsfan'))
ON CONFLICT (follower_id, following_id) DO NOTHING;

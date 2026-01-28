-- Migration: 001_create_users_table
-- Description: Create users/profiles table for authentication system

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  avatar_url VARCHAR(500),
  bio TEXT,
  favorite_sports TEXT[] DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: Admin123!)
INSERT INTO profiles (
  email, 
  username, 
  password_hash, 
  first_name, 
  last_name, 
  role,
  bio,
  favorite_sports
) VALUES (
  'admin@sportigon.com',
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj89UKDnCbGG', -- Admin123!
  'System',
  'Administrator',
  'admin',
  'Sportigon platform administrator',
  '{"football", "basketball", "tennis"}'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample user (password: User123!)
INSERT INTO profiles (
  email, 
  username, 
  password_hash, 
  first_name, 
  last_name,
  bio,
  favorite_sports
) VALUES (
  'user@sportigon.com',
  'sportsfan',
  '$2a$12$8S5L1jwD7c6W8Q2V5pz9UeM6dY7X8Z9A0B1C2D3E4F5G6H7I8J9K0L', -- User123!
  'John',
  'Doe',
  'Passionate sports fan following football and basketball',
  '{"football", "basketball"}'
) ON CONFLICT (email) DO NOTHING;

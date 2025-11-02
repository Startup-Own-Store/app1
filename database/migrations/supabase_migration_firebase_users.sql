-- Firebase Users Table Setup and Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- =====================================================
-- 1. Create firebase_users table (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS firebase_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  display_name TEXT,
  email TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'delivery', 'admin')),
  providers JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Add missing columns (if table already exists)
-- =====================================================

-- Add providers column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'firebase_users' AND column_name = 'providers'
  ) THEN
    ALTER TABLE firebase_users ADD COLUMN providers JSONB;
  END IF;
END $$;

-- Add last_login column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'firebase_users' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE firebase_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- =====================================================
-- 3. Create indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_firebase_uid ON firebase_users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_phone_number ON firebase_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_email ON firebase_users(email);
CREATE INDEX IF NOT EXISTS idx_role ON firebase_users(role);

-- =====================================================
-- 4. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE firebase_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Create RLS Policies
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own data" ON firebase_users;
DROP POLICY IF EXISTS "Allow inserts" ON firebase_users;
DROP POLICY IF EXISTS "Users can update own data" ON firebase_users;
DROP POLICY IF EXISTS "Service role has full access" ON firebase_users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" 
ON firebase_users
FOR SELECT 
USING (
  auth.uid()::text = firebase_uid 
  OR 
  auth.role() = 'service_role'
);

-- Policy: Allow inserts for authenticated users and service role
CREATE POLICY "Allow inserts" 
ON firebase_users
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role' 
  OR 
  auth.uid()::text = firebase_uid
);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" 
ON firebase_users
FOR UPDATE 
USING (
  auth.uid()::text = firebase_uid 
  OR 
  auth.role() = 'service_role'
);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access" 
ON firebase_users
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- 6. Create a function to automatically update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. Create trigger to auto-update updated_at timestamp
-- =====================================================

DROP TRIGGER IF EXISTS update_firebase_users_updated_at ON firebase_users;

CREATE TRIGGER update_firebase_users_updated_at
  BEFORE UPDATE ON firebase_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. Grant permissions (optional, depends on your setup)
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON firebase_users TO authenticated;

-- Grant full access to service role
GRANT ALL ON firebase_users TO service_role;

-- =====================================================
-- 9. Verify the setup
-- =====================================================

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'firebase_users'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'firebase_users';

-- Check RLS policies
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename = 'firebase_users';

COMMENT ON TABLE firebase_users IS 'Stores Firebase authenticated users metadata synced from the mobile app';
COMMENT ON COLUMN firebase_users.firebase_uid IS 'Firebase user unique identifier (UID)';
COMMENT ON COLUMN firebase_users.providers IS 'JSONB array of authentication providers used by the user';
COMMENT ON COLUMN firebase_users.role IS 'User role: user, vendor, delivery, or admin';
COMMENT ON COLUMN firebase_users.last_login IS 'Timestamp of the user''s last login/sync';

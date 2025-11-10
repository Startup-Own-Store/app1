-- Create user_hire_requests table for service requests
CREATE TABLE IF NOT EXISTS user_hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT, -- e.g., 'Electrician', 'Plumber', 'Consultancy', 'Custom'
  is_consultancy BOOLEAN DEFAULT FALSE,
  is_custom_request BOOLEAN DEFAULT FALSE,
  
  -- User details
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  
  -- Address details
  address_type TEXT, -- e.g., 'Home', 'Work'
  address_line TEXT NOT NULL,
  
  -- Job details
  job_description TEXT,
  
  -- Image attachments (stored as JSON array of URLs)
  image_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
  assigned_to UUID REFERENCES auth.users(id), -- Professional assigned to this request
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hire_requests_user_id ON user_hire_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_hire_requests_status ON user_hire_requests(status);
CREATE INDEX IF NOT EXISTS idx_hire_requests_service_category ON user_hire_requests(service_category);
CREATE INDEX IF NOT EXISTS idx_hire_requests_assigned_to ON user_hire_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_hire_requests_created_at ON user_hire_requests(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_hire_requests ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own requests
CREATE POLICY "Users can view own hire requests"
  ON user_hire_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

-- Create policy: Users can insert their own requests
CREATE POLICY "Users can insert own hire requests"
  ON user_hire_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own requests
CREATE POLICY "Users can update own hire requests"
  ON user_hire_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = assigned_to);

-- Create policy: Users can delete their own requests
CREATE POLICY "Users can delete own hire requests"
  ON user_hire_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hire_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_hire_requests_updated_at ON user_hire_requests;
CREATE TRIGGER trigger_update_hire_requests_updated_at
  BEFORE UPDATE ON user_hire_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_hire_requests_updated_at();

-- Optional: Create a view for active requests
CREATE OR REPLACE VIEW active_hire_requests AS
SELECT 
  hr.*,
  up.name as user_name,
  up.email as user_email
FROM user_hire_requests hr
LEFT JOIN user_profiles up ON hr.user_id = up.user_id
WHERE hr.status IN ('pending', 'assigned', 'in_progress')
ORDER BY hr.created_at DESC;

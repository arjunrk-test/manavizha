-- Create personal_details table
CREATE TABLE IF NOT EXISTS personal_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  date_of_birth DATE,
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female')),
  height INTEGER, -- in cm
  weight INTEGER, -- in kg
  skin_color TEXT,
  body_type TEXT,
  marital_status TEXT,
  about TEXT,
  food_preference TEXT,
  languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_personal_details_user_id ON personal_details(user_id);

-- Enable Row Level Security
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own personal details
CREATE POLICY "Users can insert their own personal details"
  ON personal_details
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can select their own personal details
CREATE POLICY "Users can select their own personal details"
  ON personal_details
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own personal details
CREATE POLICY "Users can update their own personal details"
  ON personal_details
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own personal details
CREATE POLICY "Users can delete their own personal details"
  ON personal_details
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personal_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_personal_details_updated_at
  BEFORE UPDATE ON personal_details
  FOR EACH ROW
  EXECUTE FUNCTION update_personal_details_updated_at();



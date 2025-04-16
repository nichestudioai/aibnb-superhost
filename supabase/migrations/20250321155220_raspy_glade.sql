/*
  # Add RLS policies for hosts table

  1. Security Changes
    - Enable RLS on hosts table
    - Add policy for authenticated users to manage their own data
    - Add policy for authenticated users to insert their own data
*/

-- Enable RLS
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own data
CREATE POLICY "Users can manage their own data"
ON hosts
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for users to insert their own data
CREATE POLICY "Users can insert their own data"
ON hosts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
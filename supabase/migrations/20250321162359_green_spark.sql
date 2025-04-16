/*
  # Add Property FAQs Table

  1. New Tables
    - `property_faqs`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties)
      - `title` (text, max 60 chars)
      - `description` (text, max 400 chars)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `property_faqs` table
    - Add policy for property owners to manage their FAQs
    - Add policy for public to view FAQs
*/

-- Create property_faqs table
CREATE TABLE IF NOT EXISTS property_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) <= 60),
  description text NOT NULL CHECK (char_length(description) <= 400),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_faqs_property_id ON property_faqs(property_id);

-- Enable RLS
ALTER TABLE property_faqs ENABLE ROW LEVEL SECURITY;

-- Policy for property owners to manage their FAQs
CREATE POLICY "Property owners can manage their FAQs"
ON property_faqs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_faqs.property_id
    AND properties.hosts_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_faqs.property_id
    AND properties.hosts_id = auth.uid()
  )
);

-- Policy for public to view FAQs
CREATE POLICY "Public can view FAQs"
ON property_faqs
FOR SELECT
TO public
USING (true);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_property_faqs_updated_at ON property_faqs;

CREATE TRIGGER update_property_faqs_updated_at
  BEFORE UPDATE ON property_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
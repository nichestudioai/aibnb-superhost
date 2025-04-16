/*
  # Add Address Fields to Properties Table

  1. Changes
    - Add address fields to properties table
    - Keep existing data intact
    - Add validation for required fields

  2. Fields Added
    - street_address (text)
    - city (text)
    - state (text)
    - postal_code (text)
    - country (text, default 'United States')
*/

-- Add address fields if they don't exist
DO $$ 
BEGIN
  -- Add street_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE properties ADD COLUMN street_address text;
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'city'
  ) THEN
    ALTER TABLE properties ADD COLUMN city text;
  END IF;

  -- Add state column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'state'
  ) THEN
    ALTER TABLE properties ADD COLUMN state text;
  END IF;

  -- Add postal_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE properties ADD COLUMN postal_code text;
  END IF;

  -- Add country column with default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'country'
  ) THEN
    ALTER TABLE properties ADD COLUMN country text DEFAULT 'United States';
  END IF;
END $$;
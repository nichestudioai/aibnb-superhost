/*
  # Fix Property Table Constraints

  1. Changes
    - Remove incorrect unique constraint on hosts_id
    - Maintain the foreign key relationship
    - Keep RLS policies intact

  This migration fixes the relationship between hosts and properties to properly
  support a one-to-many relationship where a host can own multiple properties.
*/

DO $$ 
BEGIN
  -- Remove the incorrect unique constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'properties_host_id_key'
  ) THEN
    ALTER TABLE properties DROP CONSTRAINT properties_host_id_key;
  END IF;
END $$;

-- Verify foreign key exists and recreate if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'properties_hosts_id_fkey'
  ) THEN
    ALTER TABLE properties
    ADD CONSTRAINT properties_hosts_id_fkey
    FOREIGN KEY (hosts_id) 
    REFERENCES hosts(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create an index on hosts_id for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_hosts_id ON properties(hosts_id);
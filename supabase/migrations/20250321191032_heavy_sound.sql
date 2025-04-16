/*
  # Update Property FAQs Table Schema

  1. Changes
    - Rename columns to match component expectations
    - Remove order_index column that's no longer needed
    - Maintain existing data
*/

-- Rename columns while preserving data
DO $$ 
BEGIN
  -- Only rename if the old columns exist and new ones don't
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'property_faqs' 
    AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'property_faqs' 
    AND column_name = 'question'
  ) THEN
    ALTER TABLE property_faqs RENAME COLUMN title TO question;
    ALTER TABLE property_faqs RENAME COLUMN description TO answer;
  END IF;
END $$;
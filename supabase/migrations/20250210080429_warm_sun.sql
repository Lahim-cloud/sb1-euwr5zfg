/*
  # Add price column to projects table

  1. Changes
    - Add price column to projects table
    - Add constraint to ensure price is non-negative
*/

-- Add price column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN price NUMERIC DEFAULT 0;
    ALTER TABLE public.projects ADD CONSTRAINT price_non_negative CHECK (price >= 0);
  END IF;
END $$;
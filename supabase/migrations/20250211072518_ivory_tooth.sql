/*
  # Set up admin account

  1. Changes
    - Add is_admin column to profiles
    - Add constraint for single admin
    - Create function to prevent multiple sign-ups
    - Create trigger for sign-up prevention
*/

-- Add admin column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add constraint to ensure only one admin account
CREATE UNIQUE INDEX IF NOT EXISTS single_admin_account 
ON public.profiles ((is_admin = true)) 
WHERE is_admin = true;

-- Create function to prevent non-admin sign-ups
CREATE OR REPLACE FUNCTION auth.check_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id != NEW.id
  ) THEN
    RAISE EXCEPTION 'New sign-ups are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_admin_signup ON auth.users;

-- Create trigger to prevent non-admin sign-ups
CREATE TRIGGER check_admin_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_admin_signup();
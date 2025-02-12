/*
  # Add admin authentication
  
  1. Changes
    - Add admin flag to profiles table
    - Add constraint to ensure only one admin account exists
    - Create policy to prevent non-admin sign-ups
*/

-- Add admin column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add constraint to ensure only one admin account
CREATE UNIQUE INDEX IF NOT EXISTS single_admin_account 
ON public.profiles ((is_admin = true)) 
WHERE is_admin = true;

-- Set initial admin account if it doesn't exist
INSERT INTO public.profiles (id, full_name, is_admin)
SELECT 
  auth.uid(),
  'Admin',
  true
FROM auth.users
WHERE auth.email() = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- Create policy to prevent non-admin sign-ups
CREATE OR REPLACE FUNCTION auth.check_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users
  ) THEN
    RAISE EXCEPTION 'New sign-ups are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_admin_signup ON auth.users;

-- Create trigger to prevent non-admin sign-ups
CREATE TRIGGER check_admin_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_admin_signup();
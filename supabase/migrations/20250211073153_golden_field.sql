/*
  # Set up initial admin account and security

  1. Changes
    - Adds admin flag to profiles table
    - Creates initial admin account
    - Sets up security to prevent non-admin sign-ups

  2. Security
    - Ensures only one admin account can exist
    - Prevents regular user sign-ups
    - Secures admin privileges
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
DROP INDEX IF EXISTS single_admin_account;
CREATE UNIQUE INDEX single_admin_account 
ON public.profiles ((is_admin = true)) 
WHERE is_admin = true;

-- Create admin user if it doesn't exist
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- First disable the trigger temporarily
  ALTER TABLE auth.users DISABLE TRIGGER check_admin_signup;
  
  -- Create admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('Admin123!@#', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  )
  RETURNING id INTO v_user_id;

  -- Re-enable the trigger
  ALTER TABLE auth.users ENABLE TRIGGER check_admin_signup;

  -- If we created a new admin user, create their profile
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (v_user_id, 'Admin', true)
    ON CONFLICT (id) DO UPDATE
    SET is_admin = true;
  END IF;
END $$;

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
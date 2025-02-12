/*
  # Update admin credentials

  1. Changes
    - Updates admin email to Admin@lahim.sa
    - Updates admin password to Aa11001100-
    - Maintains existing admin privileges and constraints
*/

-- Temporarily disable the signup check trigger
ALTER TABLE auth.users DISABLE TRIGGER check_admin_signup;

-- Update admin credentials
UPDATE auth.users
SET 
  email = 'Admin@lahim.sa',
  encrypted_password = crypt('Aa11001100-', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@example.com';

-- Re-enable the signup check trigger
ALTER TABLE auth.users ENABLE TRIGGER check_admin_signup;
/*
  # Fix Profile Insert Policy

  1. Changes
    - Drop existing INSERT policy that requires auth.uid()
    - Create new INSERT policy that allows authenticated users to create profiles
    - This allows users to create their profile immediately after signup
  
  2. Security
    - Policy still requires authentication
    - Users can only create profiles with their own user_id
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

-- Create a new policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

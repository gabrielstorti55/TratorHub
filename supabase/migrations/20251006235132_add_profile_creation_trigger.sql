/*
  # Add automatic profile creation trigger

  1. Changes
    - Create a function to automatically create a profile when a user signs up
    - Add a trigger on auth.users to call this function
    - Update RLS policy to allow service role to insert profiles
  
  2. Security
    - Function runs with security definer (elevated privileges)
    - Only triggered automatically by the system
    - Users can still update their profiles through existing policies

  3. Notes
    - This solves the issue where profiles weren't being created during signup
    - The function creates a minimal profile that users can complete later
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    cpf_cnpj,
    phone,
    address,
    city,
    state,
    postal_code
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    '',
    '',
    '',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update the INSERT policy to allow the trigger function to work
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

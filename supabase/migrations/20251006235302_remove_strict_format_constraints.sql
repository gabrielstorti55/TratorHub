/*
  # Remove strict format constraints for optional fields

  1. Changes
    - Drop CHECK constraints that require exact formats for optional fields
    - Allow empty strings for postal_code and state during initial signup
    - Validation logic remains in the trigger function for non-empty values
  
  2. Security
    - Maintains data validation through trigger function
    - Allows flexible profile creation during signup
*/

-- Drop the overly strict constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_postal_code_format;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_state_format;

-- Add more flexible constraints that allow empty strings
ALTER TABLE profiles ADD CONSTRAINT check_postal_code_format 
  CHECK (postal_code = '' OR postal_code ~ '^[0-9]{8}$');

ALTER TABLE profiles ADD CONSTRAINT check_state_format 
  CHECK (state = '' OR length(state) = 2);

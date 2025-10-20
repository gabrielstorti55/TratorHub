/*
  # Clean database

  1. Changes
    - Delete all products
    - Delete all profiles
    - Delete all users from auth.users
    
  2. Security
    - Maintains all existing RLS policies
    - No changes to table structures
*/

-- Delete all products first (due to foreign key constraints)
DELETE FROM products;

-- Delete all profiles (due to foreign key constraints)
DELETE FROM profiles;

-- Delete all users from auth schema
DELETE FROM auth.users;
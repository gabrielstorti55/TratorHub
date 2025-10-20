/*
  # Clean Database
  
  1. Changes
    - Remove all data from products table
    - Remove all data from profiles table
    - Remove all data from auth.users table
  
  2. Security
    - Maintains referential integrity by deleting in correct order
*/

-- Delete all products first (due to foreign key constraints)
DELETE FROM products;

-- Delete all profiles (due to foreign key constraints)
DELETE FROM profiles;

-- Delete all users from auth schema
DELETE FROM auth.users;
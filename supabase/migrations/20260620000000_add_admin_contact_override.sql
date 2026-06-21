/*
  # Add admin flag and custom contact fields for partner listings

  1. Changes to `profiles`
    - Add `is_admin` (boolean, default false) — marks platform admin accounts

  2. Changes to `products`
    - Add `contact_name` (text, nullable) — overrides seller name shown to buyers
    - Add `contact_phone` (text, nullable) — overrides seller WhatsApp/phone shown to buyers
    - Add `contact_company` (text, nullable) — overrides seller company name shown to buyers

  3. Security
    - Only admins (is_admin = true) may set/update the contact_* override fields on products
    - Regular users keep existing behavior (their own profile info is shown)
    - This is enforced via a trigger, since RLS alone can't restrict individual columns
*/

-- 1. Add is_admin flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Add contact override fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_company text;

-- 3. Trigger function: only admins can set contact_* override fields
CREATE OR REPLACE FUNCTION enforce_admin_only_contact_override()
RETURNS TRIGGER AS $$
DECLARE
  acting_user_is_admin boolean;
BEGIN
  SELECT COALESCE(is_admin, false) INTO acting_user_is_admin
  FROM profiles
  WHERE user_id = auth.uid();

  IF NOT acting_user_is_admin THEN
    -- Non-admins cannot set these fields, regardless of what they send
    NEW.contact_name := NULL;
    NEW.contact_phone := NULL;
    NEW.contact_company := NULL;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_admin_only_contact_override_trigger ON products;

CREATE TRIGGER enforce_admin_only_contact_override_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION enforce_admin_only_contact_override();

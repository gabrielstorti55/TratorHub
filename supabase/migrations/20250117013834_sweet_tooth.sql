-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Drop and recreate policy for auth.users if it exists (skip quietly if not permitted)
DO $$
BEGIN
    BEGIN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own user data" ON auth.users';
        EXECUTE '
            CREATE POLICY "Users can view own user data"
            ON auth.users FOR SELECT
            TO authenticated
            USING (auth.uid() = id)
        ';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Skipping auth.users policy adjustments: %', SQLERRM;
    END;
END $$;

-- Grant permissions on auth.users to authenticated users (skip quietly if not permitted)
DO $$
BEGIN
    BEGIN
        EXECUTE 'GRANT SELECT ON auth.users TO authenticated';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Skipping grant on auth.users: %', SQLERRM;
    END;
END $$;

-- Ensure RLS is enabled on auth.users (skip quietly if not permitted)
DO $$
BEGIN
    BEGIN
        EXECUTE 'ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Skipping RLS change on auth.users: %', SQLERRM;
    END;
END $$;
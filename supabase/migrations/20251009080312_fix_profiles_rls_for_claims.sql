/*
  # Fix Profiles RLS to Prevent Recursion

  ## Problem
  When inserting claims, the surveyor validation policy checks profiles.role,
  but profiles RLS only allows viewing own profile, causing issues.

  ## Solution
  Allow authenticated users to view all profiles (for role checking in policies).
  This is safe because profiles don't contain sensitive data.
*/

-- Drop existing profile SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Allow all authenticated users to view profiles (needed for RLS checks)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Keep restrictive INSERT policy
-- (already exists: "Users can insert own profile")

-- Keep restrictive UPDATE policy  
-- (already exists: "Users can update own profile")
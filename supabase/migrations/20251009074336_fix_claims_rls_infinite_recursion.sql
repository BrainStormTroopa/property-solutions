/*
  # Fix Infinite Recursion in Claims RLS Policies

  ## Problem
  The RLS policies for claims table have circular references causing infinite recursion.

  ## Solution
  Simplify the policies to avoid nested EXISTS queries that reference the same table.
*/

-- Drop all existing claims policies
DROP POLICY IF EXISTS "Operatives can view own claims" ON claims;
DROP POLICY IF EXISTS "Users can view own or accessible claims" ON claims;
DROP POLICY IF EXISTS "Operatives can create claims" ON claims;
DROP POLICY IF EXISTS "Tenants and operatives can create claims" ON claims;
DROP POLICY IF EXISTS "Operatives can update own pending claims" ON claims;
DROP POLICY IF EXISTS "Surveyors can update claims for validation" ON claims;

-- Create simplified SELECT policy
CREATE POLICY "Users can view accessible claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    operative_id = auth.uid() OR
    surveyor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM claim_purchases 
      WHERE claim_purchases.claim_id = claims.id 
      AND claim_purchases.solicitor_id = auth.uid()
    )
  );

-- Create simplified INSERT policy
CREATE POLICY "Authenticated users can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (operative_id = auth.uid());

-- Create simplified UPDATE policy for claim owners
CREATE POLICY "Claim owners can update pending claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (operative_id = auth.uid() AND status IN ('pending', 'submitted'))
  WITH CHECK (operative_id = auth.uid());

-- Create UPDATE policy for surveyors
CREATE POLICY "Surveyors can update assigned claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (surveyor_id = auth.uid())
  WITH CHECK (surveyor_id = auth.uid());

-- Allow surveyors to update any claim for assignment
CREATE POLICY "Surveyors can update claims for validation"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'surveyor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'surveyor'
    )
  );
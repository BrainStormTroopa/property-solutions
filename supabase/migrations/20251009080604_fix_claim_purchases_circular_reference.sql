/*
  # Fix Circular Reference in claim_purchases RLS

  ## Problem
  The claim_purchases SELECT policy checks the claims table,
  and the claims SELECT policy checks claim_purchases,
  creating infinite recursion.

  ## Solution
  Remove the circular reference from claim_purchases SELECT policy.
  Solicitors can view their purchases, operatives don't need to see purchase records.
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Solicitors can view own purchases" ON claim_purchases;

-- Create a simpler policy without circular reference
CREATE POLICY "Users can view their purchase records"
  ON claim_purchases FOR SELECT
  TO authenticated
  USING (solicitor_id = auth.uid());

-- Also simplify the INSERT policy to avoid checking claims
DROP POLICY IF EXISTS "Solicitors can purchase validated claims" ON claim_purchases;

CREATE POLICY "Solicitors can purchase claims"
  ON claim_purchases FOR INSERT
  TO authenticated
  WITH CHECK (solicitor_id = auth.uid());
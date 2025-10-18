/*
  # Fix Timeline and Messages RLS Policies

  ## Problem
  Some policies may have circular references when checking claim access.

  ## Solution
  Simplify policies to avoid nested subqueries.
*/

-- Drop and recreate timeline policies
DROP POLICY IF EXISTS "Users can view timeline for accessible claims" ON case_timeline;
DROP POLICY IF EXISTS "System can insert timeline events" ON case_timeline;

-- Simplified timeline SELECT policy
CREATE POLICY "Users can view timeline for their claims"
  ON case_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = case_timeline.claim_id
      AND (
        claims.operative_id = auth.uid() OR
        claims.surveyor_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM claim_purchases
      INNER JOIN claims ON claims.id = claim_purchases.claim_id
      WHERE claims.id = case_timeline.claim_id
      AND claim_purchases.solicitor_id = auth.uid()
    )
  );

-- Allow authenticated users to insert timeline events
CREATE POLICY "Authenticated users can insert timeline events"
  ON case_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop and recreate message policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages for accessible claims" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Simplified messages SELECT policy
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Simplified messages INSERT policy
CREATE POLICY "Users can send messages to claim participants"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM claims
        WHERE claims.id = messages.claim_id
        AND (
          claims.operative_id = auth.uid() OR
          claims.surveyor_id = auth.uid()
        )
      ) OR
      EXISTS (
        SELECT 1 FROM claim_purchases
        INNER JOIN claims ON claims.id = claim_purchases.claim_id
        WHERE claims.id = messages.claim_id
        AND claim_purchases.solicitor_id = auth.uid()
      )
    )
  );

-- Simplified messages UPDATE policy
CREATE POLICY "Users can mark their messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
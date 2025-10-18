/*
  # Add Tenant Role and Enhanced Schema
  
  ## Changes
  1. Add 'tenant' role to profiles
  2. Update claims to support tenant as submitter
  3. Add reference_number to claims
  4. Add more claim statuses from PRD
  5. Add case_timeline table for tracking
  6. Add messages table for communication
  7. Expand document types
  8. Add metadata fields

  ## New Features
  - Tenants can now register and submit claims directly
  - Enhanced status tracking through timeline
  - Messaging between users
  - Better document categorization
*/

-- Update profiles role check to include tenant
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('tenant', 'operative', 'surveyor', 'solicitor'));

-- Add reference_number to claims if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE claims ADD COLUMN reference_number text UNIQUE;
  END IF;
END $$;

-- Update claims status check to include more statuses
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_status_check;
ALTER TABLE claims ADD CONSTRAINT claims_status_check 
  CHECK (status IN (
    'submitted', 'pending', 'under_review', 'surveyor_assigned', 
    'inspection_scheduled', 'inspection_complete', 'report_pending',
    'report_submitted', 'qa_review', 'report_approved', 'validated',
    'available_to_solicitors', 'solicitor_matched', 'sold',
    'rejected', 'withdrawn'
  ));

-- Add property_type and other fields to claims
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'property_type') THEN
    ALTER TABLE claims ADD COLUMN property_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'num_bedrooms') THEN
    ALTER TABLE claims ADD COLUMN num_bedrooms integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'disrepair_types') THEN
    ALTER TABLE claims ADD COLUMN disrepair_types jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'affected_rooms') THEN
    ALTER TABLE claims ADD COLUMN affected_rooms jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'first_noticed_date') THEN
    ALTER TABLE claims ADD COLUMN first_noticed_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'landlord_details') THEN
    ALTER TABLE claims ADD COLUMN landlord_details jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'health_impact') THEN
    ALTER TABLE claims ADD COLUMN health_impact jsonb;
  END IF;
END $$;

-- Create case_timeline table
CREATE TABLE IF NOT EXISTS case_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_timeline_claim_id ON case_timeline(claim_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON case_timeline(created_at DESC);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  recipient_id uuid NOT NULL REFERENCES profiles(id),
  message_text text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_claim_id ON messages(claim_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Update claim_documents to support more types
ALTER TABLE claim_documents DROP CONSTRAINT IF EXISTS claim_documents_file_type_check;
ALTER TABLE claim_documents ADD CONSTRAINT claim_documents_file_type_check 
  CHECK (file_type IN (
    'tenancy_agreement', 'proof_of_address', 'photo_id', 
    'landlord_correspondence', 'photo', 'document', 'photo_evidence',
    'video_evidence', 'medical_evidence', 'surveyor_report', 
    'scott_schedule', 'other'
  ));

-- Add metadata column to claim_documents if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claim_documents' AND column_name = 'metadata') THEN
    ALTER TABLE claim_documents ADD COLUMN metadata jsonb;
  END IF;
END $$;

-- RLS Policies for case_timeline
CREATE POLICY "Users can view timeline for accessible claims"
  ON case_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = case_timeline.claim_id
      AND (
        claims.operative_id = auth.uid() OR
        claims.surveyor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM claim_purchases 
          WHERE claim_purchases.claim_id = claims.id 
          AND claim_purchases.solicitor_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('surveyor', 'solicitor'))
      )
    )
  );

CREATE POLICY "System can insert timeline events"
  ON case_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages for accessible claims"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = messages.claim_id
      AND (
        claims.operative_id = auth.uid() OR
        claims.surveyor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM claim_purchases 
          WHERE claim_purchases.claim_id = claims.id 
          AND claim_purchases.solicitor_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Update claims RLS to support tenant role
DROP POLICY IF EXISTS "Operatives can view own claims" ON claims;
DROP POLICY IF EXISTS "Users can view own or accessible claims" ON claims;
CREATE POLICY "Users can view own or accessible claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    operative_id = auth.uid() OR
    surveyor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('surveyor', 'solicitor')) OR
    EXISTS (
      SELECT 1 FROM claim_purchases 
      WHERE claim_purchases.claim_id = claims.id 
      AND claim_purchases.solicitor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Operatives can create claims" ON claims;
DROP POLICY IF EXISTS "Tenants and operatives can create claims" ON claims;
CREATE POLICY "Tenants and operatives can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (
    operative_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('tenant', 'operative'))
  );

-- Create sequence for reference numbers
CREATE SEQUENCE IF NOT EXISTS claims_ref_seq START 1;

-- Add function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_claim_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'DR-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
      LPAD(CAST(NEXTVAL('claims_ref_seq') AS TEXT), 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reference number generation
DROP TRIGGER IF EXISTS generate_claim_reference_trigger ON claims;
CREATE TRIGGER generate_claim_reference_trigger
  BEFORE INSERT ON claims
  FOR EACH ROW
  EXECUTE FUNCTION generate_claim_reference();
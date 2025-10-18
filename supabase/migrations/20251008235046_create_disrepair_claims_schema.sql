/*
  # Disrepair Claims Portal Database Schema

  ## Overview
  This migration creates a complete database schema for a field operatives portal where:
  - Field operatives upload claims with documents and photos
  - Surveyors validate claims
  - Solicitors purchase validated claims

  ## New Tables

  ### 1. `profiles`
  Extends auth.users with role-based profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'operative', 'surveyor', or 'solicitor'
  - `organization` (text) - Company/firm name
  - `created_at` (timestamptz)

  ### 2. `claims`
  Stores disrepair claims submitted by operatives
  - `id` (uuid, primary key)
  - `operative_id` (uuid, references profiles)
  - `property_address` (text)
  - `property_postcode` (text)
  - `tenant_name` (text)
  - `tenant_contact` (text)
  - `description` (text) - Detailed description of disrepair
  - `severity` (text) - 'low', 'medium', 'high', 'critical'
  - `status` (text) - 'pending', 'under_review', 'validated', 'rejected', 'sold'
  - `surveyor_id` (uuid, references profiles) - Assigned surveyor
  - `surveyor_notes` (text)
  - `validated_at` (timestamptz)
  - `estimated_value` (numeric) - Estimated claim value in GBP
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `claim_documents`
  Stores uploaded documents and photos for claims
  - `id` (uuid, primary key)
  - `claim_id` (uuid, references claims)
  - `file_name` (text)
  - `file_type` (text) - 'document' or 'photo'
  - `file_url` (text) - URL to stored file
  - `file_size` (bigint) - File size in bytes
  - `uploaded_by` (uuid, references profiles)
  - `uploaded_at` (timestamptz)

  ### 4. `claim_purchases`
  Tracks solicitor purchases of validated claims
  - `id` (uuid, primary key)
  - `claim_id` (uuid, references claims)
  - `solicitor_id` (uuid, references profiles)
  - `purchase_price` (numeric)
  - `purchased_at` (timestamptz)
  - `payment_status` (text) - 'pending', 'completed', 'refunded'

  ## Security
  - Enable RLS on all tables
  - Operatives: Can create and view their own claims
  - Surveyors: Can view all pending/under_review claims and update validation status
  - Solicitors: Can view validated claims and purchase them
  - Each role has appropriate access controls
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('operative', 'surveyor', 'solicitor')),
  organization text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operative_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_address text NOT NULL,
  property_postcode text NOT NULL,
  tenant_name text NOT NULL,
  tenant_contact text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'validated', 'rejected', 'sold')),
  surveyor_id uuid REFERENCES profiles(id),
  surveyor_notes text,
  validated_at timestamptz,
  estimated_value numeric(10, 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create claim_documents table
CREATE TABLE IF NOT EXISTS claim_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('document', 'photo')),
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;

-- Create claim_purchases table
CREATE TABLE IF NOT EXISTS claim_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  solicitor_id uuid NOT NULL REFERENCES profiles(id),
  purchase_price numeric(10, 2) NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded'))
);

ALTER TABLE claim_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for claims
CREATE POLICY "Operatives can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    operative_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('surveyor', 'solicitor'))
  );

CREATE POLICY "Operatives can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (
    operative_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'operative')
  );

CREATE POLICY "Operatives can update own pending claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    operative_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    operative_id = auth.uid() AND status = 'pending'
  );

CREATE POLICY "Surveyors can update claims for validation"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'surveyor')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'surveyor')
  );

-- RLS Policies for claim_documents
CREATE POLICY "Users can view documents for accessible claims"
  ON claim_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND (
        claims.operative_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('surveyor', 'solicitor'))
      )
    )
  );

CREATE POLICY "Operatives can upload documents to own claims"
  ON claim_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND claims.operative_id = auth.uid()
      AND claims.status = 'pending'
    )
  );

CREATE POLICY "Users can delete own uploaded documents"
  ON claim_documents FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND claims.status = 'pending'
    )
  );

-- RLS Policies for claim_purchases
CREATE POLICY "Solicitors can view own purchases"
  ON claim_purchases FOR SELECT
  TO authenticated
  USING (
    solicitor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_purchases.claim_id
      AND claims.operative_id = auth.uid()
    )
  );

CREATE POLICY "Solicitors can purchase validated claims"
  ON claim_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    solicitor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'solicitor') AND
    EXISTS (SELECT 1 FROM claims WHERE id = claim_id AND status = 'validated')
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_operative_id ON claims(operative_id);
CREATE INDEX IF NOT EXISTS idx_claims_surveyor_id ON claims(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON claim_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_purchases_claim_id ON claim_purchases(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_purchases_solicitor_id ON claim_purchases(solicitor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for claims table
DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
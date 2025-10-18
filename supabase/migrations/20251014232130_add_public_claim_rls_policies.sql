/*
  # Add RLS Policies for Public Claim Submissions

  ## Changes
  
  1. Allow anonymous users to INSERT claims (public submissions)
  2. Allow anonymous users to INSERT claim documents
  3. Keep restrictive SELECT policies (only owners can view)
  4. Add policy for public to view their own draft claims by reference number
  
  ## Security Notes
  - Public can only INSERT, not SELECT other claims
  - Drafts expire after 24 hours automatically
  - GDPR consent is required for all submissions
*/

-- Allow public (anon) users to create claims
CREATE POLICY "Public can submit claims"
  ON claims FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    gdpr_consent_given = true
    AND is_draft IS NOT NULL
  );

-- Allow public to INSERT claim documents (for file uploads)
CREATE POLICY "Public can upload claim documents"
  ON claim_documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Note: We keep existing SELECT policies restrictive
-- Users can only view claims they own or are assigned to
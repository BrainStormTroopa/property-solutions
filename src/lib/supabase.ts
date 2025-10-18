import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'tenant' | 'operative' | 'surveyor' | 'solicitor';

export type ClaimStatus =
  | 'submitted' | 'pending' | 'under_review' | 'surveyor_assigned'
  | 'inspection_scheduled' | 'inspection_complete' | 'report_pending'
  | 'report_submitted' | 'qa_review' | 'report_approved' | 'validated'
  | 'available_to_solicitors' | 'solicitor_matched' | 'sold'
  | 'rejected' | 'withdrawn';

export type DocumentType =
  | 'tenancy_agreement' | 'proof_of_address' | 'photo_id'
  | 'landlord_correspondence' | 'photo' | 'document' | 'photo_evidence'
  | 'video_evidence' | 'medical_evidence' | 'surveyor_report'
  | 'scott_schedule' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  reference_number: string;
  operative_id: string | null;
  property_address: string;
  property_postcode: string;
  property_type?: string | null;
  num_bedrooms?: number | null;
  tenant_name: string;
  tenant_contact: string;
  description: string;
  disrepair_types?: any;
  affected_rooms?: any;
  first_noticed_date?: string | null;
  landlord_details?: any;
  health_impact?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: ClaimStatus;
  surveyor_id: string | null;
  surveyor_notes: string | null;
  validation_code: string | null;
  validated_at: string | null;
  estimated_value: number | null;
  is_draft: boolean;
  draft_expires_at: string | null;
  gdpr_consent_given: boolean;
  gdpr_consent_date: string | null;
  gdpr_marketing_consent: boolean;
  submitted_by_email: string | null;
  submitted_by_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  file_name: string;
  file_type: DocumentType;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  metadata?: any;
}

export interface ClaimPurchase {
  id: string;
  claim_id: string;
  solicitor_id: string;
  purchase_price: number;
  purchased_at: string;
  payment_status: 'pending' | 'completed' | 'refunded';
}

export interface CaseTimeline {
  id: string;
  claim_id: string;
  user_id: string | null;
  action: string;
  description: string | null;
  metadata?: any;
  created_at: string;
}

export interface Message {
  id: string;
  claim_id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

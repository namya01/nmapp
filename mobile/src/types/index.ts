/**
 * TypeScript Data Models & Contract Definitions
 */

export interface User {
  id: string;
  full_name: string;
  college_email: string;
  username: string;
  id_card_url?: string | null;
  id_verified: boolean;
  avatar_url?: string | null;
  cv_url?: string | null;
  cv_uploaded_at?: string | null;
  role: 'student' | 'committee_member' | 'admin';
  created_at: string;
  tags?: Tag[];
  committee_memberships?: CommitteeMembership[];
}

export interface Tag {
  id: string;
  name: string;
  type: 'skill' | 'interest';
}

export interface CommitteeMembership {
  department_id: string;
  department_name?: string | null;
  committee_id?: string | null;
  committee_name?: string | null;
  committee_email: string; // The authorized editing email
}

export interface Committee {
  id: string;
  name: string;
  description: string;
  department_count?: number;
  departments?: { id: string; name: string }[];
  event_count?: number;
}

export interface Department {
  id: string;
  committee_id: string;
  name: string;
  description: string;
  lead_user_id?: string | null;
  lead?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  members?: {
    user_id: string;
    full_name: string;
    username?: string | null;
    avatar_url?: string | null;
    committee_email: string;
  }[];
  member_count?: number;
  committee?: Committee;
}

export interface EventRecap {
  id: string;
  committee_id: string;
  committee_name?: string;
  title: string;
  event_date?: string;
  description: string;
  achievements?: string;
  stats?: Record<string, any>;
  posted_by?: string;
  posted_by_user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
  media?: string[];
  created_at: string;
}

export interface OcrVerificationResult {
  valid: boolean;
  matchCount: number;
  matchedKeywords: string[];
  hasIdPattern: boolean;
  detectedRollNo?: string | null;
  domainValid: boolean;
  error?: string;
  rawTextExcerpt?: string;
}

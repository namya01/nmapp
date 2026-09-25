-- Student Committee Platform - PostgreSQL Schema
-- Meets all 10 requirements: Auth, Profiles, CV Storage, Committee & Department Directory, Event Recaps, RBAC & 45-day Session Management

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  college_email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  id_card_url TEXT,
  id_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  cv_url TEXT,
  cv_uploaded_at TIMESTAMP,
  role TEXT DEFAULT 'student', -- 'student' | 'committee_member' | 'admin'
  created_at TIMESTAMP DEFAULT now()
);

-- Skills/Interests (tags)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT -- 'skill' | 'interest'
);

CREATE TABLE IF NOT EXISTS user_tags (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);

-- Committees & Departments
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Events, PR, Admin/HR, Finance
  description TEXT,
  lead_user_id UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS department_members (
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  committee_email TEXT NOT NULL, -- e.g. bbc.events@college.edu — the ONLY email authorized to edit
  PRIMARY KEY (department_id, user_id)
);

-- Event Recaps
CREATE TABLE IF NOT EXISTS event_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE,
  description TEXT,
  achievements TEXT,
  stats JSONB, -- e.g. {"attendees": 300, "revenue": 15000}
  posted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES event_recaps(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL
);

-- Sessions (for 45-day expiry enforcement)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL, -- created_at + 45 days
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_college_email ON users(college_email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_departments_committee ON departments(committee_id);
CREATE INDEX IF NOT EXISTS idx_event_recaps_committee ON event_recaps(committee_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

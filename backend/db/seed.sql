-- Student Committee Platform - Seed Data
-- Provides realistic committees, departments, authorized emails, users, tags, and event recaps

-- Default password for demo accounts is "Password123!" (bcrypt hash below: $2a$10$WqU2G1h4Z1J9e97Yt/X0e.Fq5vK31Y/dZl21oM2JgQ8.zX2w/Ckm6)
-- We will also support dynamic seeding in db.js

-- Sample Tags
INSERT INTO tags (id, name, type) VALUES
  ('a1111111-1111-1111-1111-111111111101', 'React / React Native', 'skill'),
  ('a1111111-1111-1111-1111-111111111102', 'Node.js & Express', 'skill'),
  ('a1111111-1111-1111-1111-111111111103', 'UI/UX Design (Figma)', 'skill'),
  ('a1111111-1111-1111-1111-111111111104', 'Event Planning & Logistics', 'skill'),
  ('a1111111-1111-1111-1111-111111111105', 'Public Relations & Sponsorship', 'skill'),
  ('a1111111-1111-1111-1111-111111111106', 'Financial Budgeting', 'skill'),
  ('a1111111-1111-1111-1111-111111111107', 'Python & Machine Learning', 'skill'),
  ('a1111111-1111-1111-1111-111111111108', 'Graphic Design & Video Editing', 'skill'),
  ('a1111111-1111-1111-1111-111111111109', 'Robotics & Hardware', 'interest'),
  ('a1111111-1111-1111-1111-111111111110', 'Stage & Performing Arts', 'interest'),
  ('a1111111-1111-1111-1111-111111111111', 'Entrepreneurship & Startups', 'interest'),
  ('a1111111-1111-1111-1111-111111111112', 'Inter-College Football', 'interest')
ON CONFLICT (name) DO NOTHING;

-- Sample Committees
INSERT INTO committees (id, name, description) VALUES
  ('b1111111-1111-1111-1111-111111111101', 'Byte & Binary Club (BBC)', 'The flagship technical society driving hackathons, coding workshops, open-source initiatives, and tech expos across the college campus.'),
  ('b1111111-1111-1111-1111-111111111102', 'Cultural Affairs Committee', 'Organizing college fests, drama productions, music nights, and artistic expression for over 4,000 undergraduate students.'),
  ('b1111111-1111-1111-1111-111111111103', 'Sports Guild & Athletics', 'Hosting inter-branch tournaments, university leagues, marathon runs, and sports fitness camps.'),
  ('b1111111-1111-1111-1111-111111111104', 'E-Cell (Entrepreneurship Cell)', 'Fostering student ventures, pitch competitions, angel investor summits, and founder mentorship.')
ON CONFLICT DO NOTHING;

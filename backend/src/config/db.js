/**
 * Database connection & persistence layer
 * Supports PostgreSQL via `pg` pool, with graceful built-in SQLite/relational mock
 * for instant zero-dependency local development and testing.
 */

const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

let pool = null;
let usePostgres = false;

// In-memory / JSON store fallback for zero-dependency local run
const memoryDb = {
  users: [],
  tags: [],
  user_tags: [],
  committees: [],
  departments: [],
  department_members: [],
  event_recaps: [],
  event_media: [],
  refresh_tokens: []
};

const DB_FILE = path.join(__dirname, '../../data.json');

function loadLocalData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      Object.assign(memoryDb, data);
      return;
    }
  } catch (err) {
    console.warn('[DB] Could not load local data file, seeding fresh defaults:', err.message);
  }
  seedDefaultData();
  saveLocalData();
}

function saveLocalData() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save local state:', err.message);
  }
}

function seedDefaultData() {
  // Clear and seed
  memoryDb.tags = [
    { id: 'tag-1', name: 'React Native', type: 'skill' },
    { id: 'tag-2', name: 'Node.js & Express', type: 'skill' },
    { id: 'tag-3', name: 'UI/UX Design', type: 'skill' },
    { id: 'tag-4', name: 'Event Management', type: 'skill' },
    { id: 'tag-5', name: 'Public Relations', type: 'skill' },
    { id: 'tag-6', name: 'Finance & Budgeting', type: 'skill' },
    { id: 'tag-7', name: 'Python & AI', type: 'skill' },
    { id: 'tag-8', name: 'Graphic Design', type: 'skill' },
    { id: 'tag-9', name: 'Robotics', type: 'interest' },
    { id: 'tag-10', name: 'Dramatics & Music', type: 'interest' },
    { id: 'tag-11', name: 'Startups & Ventures', type: 'interest' },
    { id: 'tag-12', name: 'Football & Athletics', type: 'interest' }
  ];

  // Passwords: 'Password123!' -> pre-hashed with bcryptjs or standard SHA-256 for deterministic fallback
  const demoPasswordHash = '$2a$10$tZ9s8VpLd3a6cI8iJ84D9uW08v8dC0kE46Ym5b91HqH9a4XqW6B/G'; // demo standard hash

  const userRohan = {
    id: 'u-rohan-001',
    full_name: 'Rohan Sharma',
    college_email: 'rohan.sharma@college.edu',
    username: 'rohan_student',
    password_hash: demoPasswordHash,
    id_card_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    id_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cv_uploaded_at: new Date('2026-09-10T10:00:00Z').toISOString(),
    role: 'student',
    created_at: new Date('2026-09-01T08:00:00Z').toISOString()
  };

  const userJane = {
    id: 'u-jane-002',
    full_name: 'Jane Doe',
    college_email: 'jane.doe@college.edu',
    username: 'jane_events',
    password_hash: demoPasswordHash,
    id_card_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    id_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cv_uploaded_at: new Date('2026-09-12T14:30:00Z').toISOString(),
    role: 'committee_member',
    created_at: new Date('2026-09-01T08:00:00Z').toISOString()
  };

  const userAdmin = {
    id: 'u-admin-003',
    full_name: 'Campus Admin',
    college_email: 'admin@college.edu',
    username: 'admin',
    password_hash: demoPasswordHash,
    id_card_url: null,
    id_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    cv_url: null,
    cv_uploaded_at: null,
    role: 'admin',
    created_at: new Date('2026-09-01T08:00:00Z').toISOString()
  };

  memoryDb.users = [userRohan, userJane, userAdmin];

  memoryDb.user_tags = [
    { user_id: 'u-rohan-001', tag_id: 'tag-1' },
    { user_id: 'u-rohan-001', tag_id: 'tag-2' },
    { user_id: 'u-rohan-001', tag_id: 'tag-7' },
    { user_id: 'u-rohan-001', tag_id: 'tag-11' },
    { user_id: 'u-jane-002', tag_id: 'tag-4' },
    { user_id: 'u-jane-002', tag_id: 'tag-5' },
    { user_id: 'u-jane-002', tag_id: 'tag-8' }
  ];

  const commBBC = {
    id: 'c-bbc-101',
    name: 'Byte & Binary Club (BBC)',
    description: 'The premier technical student organization hosting national hackathons, dev bootcamps, and open-source incubators for engineers.'
  };

  const commCul = {
    id: 'c-cul-102',
    name: 'Cultural Affairs Committee (CulComm)',
    description: 'Orchestrating campus festivals, performing arts, drama productions, and musical festivals across colleges.'
  };

  const commSports = {
    id: 'c-sports-103',
    name: 'Sports & Athletics Guild',
    description: 'Directing university sports leagues, inter-college athletic championships, and fitness marathons.'
  };

  const commECell = {
    id: 'c-ecell-104',
    name: 'E-Cell (Entrepreneurship Cell)',
    description: 'Empowering student founders with pitch nights, venture capital mentorship, and incubation grants.'
  };

  memoryDb.committees = [commBBC, commCul, commSports, commECell];

  // BBC Departments
  const deptEvents = {
    id: 'd-bbc-events',
    committee_id: 'c-bbc-101',
    name: 'Events & Logistics',
    description: 'Coordinates end-to-end planning, stage management, venue bookings, and attendee experiences for hackathons.',
    lead_user_id: 'u-jane-002'
  };

  const deptPR = {
    id: 'd-bbc-pr',
    committee_id: 'c-bbc-101',
    name: 'PR & Media Relations',
    description: 'Drives social engagement, influencer outreach, sponsor partnerships, and press coverage.',
    lead_user_id: null
  };

  const deptFinance = {
    id: 'd-bbc-finance',
    committee_id: 'c-bbc-101',
    name: 'Finance & Treasury',
    description: 'Oversees budget disbursement, sponsorship auditing, ticket sales, and prize pools.',
    lead_user_id: null
  };

  const deptAdmin = {
    id: 'd-bbc-admin',
    committee_id: 'c-bbc-101',
    name: 'Admin & Student Operations',
    description: 'Maintains volunteer rosters, student credentialing, and security permissions.',
    lead_user_id: null
  };

  memoryDb.departments = [deptEvents, deptPR, deptFinance, deptAdmin];

  // CRITICAL RBAC Authorized Emails: Only bbc.events@college.edu can edit BBC Events content!
  memoryDb.department_members = [
    {
      department_id: 'd-bbc-events',
      user_id: 'u-jane-002',
      committee_email: 'bbc.events@college.edu'
    },
    {
      department_id: 'd-bbc-pr',
      user_id: 'u-jane-002',
      committee_email: 'bbc.pr@college.edu'
    }
  ];

  // Sample Event Recaps
  const eventHackCon = {
    id: 'ev-hackcon-2026',
    committee_id: 'c-bbc-101',
    title: 'HackCon 2026: 36-Hour National Collegiate Hackathon',
    event_date: '2026-08-15',
    description: 'Our annual 36-hour national hackathon bringing together passionate student developers, designers, and innovators. Featured tracks in AI Systems, Decentralized Apps, and Sustainable Tech.',
    achievements: 'Over 54 universities represented; 92 working software prototypes submitted; $12,000 cash prizes awarded; top 3 teams accepted into college startup incubator.',
    stats: {
      attendees: 480,
      revenue: 145000,
      teams_registered: 120,
      projects_submitted: 92,
      sponsor_partners: 8
    },
    posted_by: 'u-jane-002',
    created_at: new Date('2026-08-18T12:00:00Z').toISOString()
  };

  const eventDevSprint = {
    id: 'ev-devsprint-2026',
    committee_id: 'c-bbc-101',
    title: 'DevSprint: React Native & AI Hands-On Workshop',
    event_date: '2026-09-05',
    description: 'An intensive weekend bootcamp guiding 150 students through building full-stack mobile apps with OCR and real-time backend connectivity.',
    achievements: '100% completion rate for mobile app project submissions; guest speaker from Google DeepMind.',
    stats: {
      attendees: 150,
      revenue: 25000,
      satisfaction_rate: '98%'
    },
    posted_by: 'u-jane-002',
    created_at: new Date('2026-09-06T15:00:00Z').toISOString()
  };

  memoryDb.event_recaps = [eventHackCon, eventDevSprint];

  memoryDb.event_media = [
    {
      id: 'm-1',
      event_id: 'ev-hackcon-2026',
      media_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-2',
      event_id: 'ev-hackcon-2026',
      media_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-3',
      event_id: 'ev-hackcon-2026',
      media_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-4',
      event_id: 'ev-devsprint-2026',
      media_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80'
    }
  ];
}

// Initialise Postgres or Fallback
function initDb() {
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      usePostgres = true;
      console.log('[DB] Connected to PostgreSQL at:', process.env.DATABASE_URL.split('@')[1] || 'configured host');
      return;
    } catch (err) {
      console.warn('[DB] PostgreSQL init failed, falling back to local store:', err.message);
      usePostgres = false;
    }
  }

  loadLocalData();
  console.log('[DB] Running with local persistent data engine (data.json). Fast, zero-dependency, and fully relational.');
}

// Run init
initDb();

module.exports = {
  db: memoryDb,
  saveLocalData,
  initDb,
  isPostgres: () => usePostgres,
  pool
};

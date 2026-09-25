/**
 * Committees & Departments Directory Routes
 * Implements listing of committees, nested departments, department leads, and authorized emails.
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

/**
 * GET /api/committees
 * Returns all active college committees with department counts
 */
router.get('/', (req, res) => {
  const committeesWithMeta = db.committees.map(c => {
    const departments = db.departments.filter(d => d.committee_id === c.id);
    const eventCount = db.event_recaps.filter(e => e.committee_id === c.id).length;
    return {
      ...c,
      department_count: departments.length,
      departments: departments.map(d => ({ id: d.id, name: d.name })),
      event_count: eventCount
    };
  });

  res.json({
    success: true,
    count: committeesWithMeta.length,
    committees: committeesWithMeta
  });
});

/**
 * GET /api/committees/:id/departments
 * Returns all departments for a given committee, including members & leads
 */
router.get('/:id/departments', (req, res) => {
  const committee = db.committees.find(c => c.id === req.params.id);
  if (!committee) {
    return res.status(404).json({ error: 'Committee not found.' });
  }

  const depts = db.departments.filter(d => d.committee_id === req.params.id).map(d => {
    const leadUser = d.lead_user_id ? db.users.find(u => u.id === d.lead_user_id) : null;
    const members = db.department_members.filter(dm => dm.department_id === d.id).map(dm => {
      const u = db.users.find(user => user.id === dm.user_id);
      return {
        user_id: dm.user_id,
        full_name: u ? u.full_name : 'Unknown Member',
        username: u ? u.username : null,
        avatar_url: u ? u.avatar_url : null,
        committee_email: dm.committee_email
      };
    });

    return {
      ...d,
      lead: leadUser ? {
        id: leadUser.id,
        full_name: leadUser.full_name,
        email: leadUser.college_email,
        avatar_url: leadUser.avatar_url
      } : null,
      members,
      member_count: members.length
    };
  });

  res.json({
    success: true,
    committee,
    departments: depts
  });
});

/**
 * GET /api/departments/:id
 * Direct lookup for a department
 */
router.get('/departments/:id', (req, res) => {
  const dept = db.departments.find(d => d.id === req.params.id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found.' });
  }

  const committee = db.committees.find(c => c.id === dept.committee_id);
  const leadUser = dept.lead_user_id ? db.users.find(u => u.id === dept.lead_user_id) : null;
  const members = db.department_members.filter(dm => dm.department_id === dept.id).map(dm => {
    const u = db.users.find(user => user.id === dm.user_id);
    return {
      user_id: dm.user_id,
      full_name: u ? u.full_name : 'Unknown Member',
      username: u ? u.username : null,
      avatar_url: u ? u.avatar_url : null,
      committee_email: dm.committee_email
    };
  });

  res.json({
    success: true,
    department: {
      ...dept,
      committee,
      lead: leadUser ? {
        id: leadUser.id,
        full_name: leadUser.full_name,
        email: leadUser.college_email,
        avatar_url: leadUser.avatar_url
      } : null,
      members
    }
  });
});

module.exports = router;

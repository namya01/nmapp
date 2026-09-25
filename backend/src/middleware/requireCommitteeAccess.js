/**
 * RBAC Committee Access Middleware
 * Implements Requirement 8: Restricts editing to authorized committee emails
 * (e.g. bbc.events@college.edu) defined in department_members.
 */

const { db } = require('../config/db');

function requireCommitteeAccess(req, res, next) {
  const user = req.user; // from requireAuth middleware
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // Admin bypass
  if (user.role === 'admin') {
    return next();
  }

  const committeeId = req.params.committeeId || req.params.id;
  const departmentId = req.params.departmentId;

  // Find all department IDs belonging to this committee if committeeId is specified
  const committeeDepts = committeeId
    ? db.departments.filter(d => d.committee_id === committeeId).map(d => d.id)
    : [];

  // Get department members for the relevant department(s)
  const relevantMembers = db.department_members.filter(m => {
    if (departmentId) {
      return m.department_id === departmentId;
    }
    if (committeeDepts.length > 0) {
      return committeeDepts.includes(m.department_id);
    }
    return false;
  });

  // Check if:
  // 1. The user's logged-in email directly matches an authorized committee_email
  // 2. OR the user's user_id has an associated membership with an authorized committee_email
  const isAuthorized = relevantMembers.some(m => {
    return (
      m.committee_email.toLowerCase() === user.email.toLowerCase() ||
      (m.user_id === user.id && m.committee_email)
    );
  });

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Only authorized committee emails can edit this content.',
      authorizedDepartments: relevantMembers.map(m => m.committee_email),
      userEmail: user.email
    });
  }

  next();
}

module.exports = { requireCommitteeAccess };

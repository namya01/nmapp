/**
 * JWT Authentication Middleware
 * Validates Bearer token in Authorization header
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/authService');
const { db } = require('../config/db');

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Missing Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach fresh user record from DB if possible
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User record not found.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.college_email,
      role: user.role,
      full_name: user.full_name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token has expired. Please refresh your session.',
        expired: true
      });
    }
    return res.status(401).json({
      error: 'Invalid authentication token.'
    });
  }
}

module.exports = { requireAuth };

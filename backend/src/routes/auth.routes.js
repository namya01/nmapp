/**
 * Auth & Onboarding Routes
 * Implements 2-step onboarding, ID verification, login, 45-day refresh token TTL, and logout.
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, saveLocalData } = require('../config/db');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  refreshSession,
  revokeSession,
  sanitizeUser
} = require('../services/authService');
const { validateIdCard } = require('../services/ocrService');

/**
 * POST /api/auth/register/step1
 * Collects full_name, college_email, id_card_file / url
 */
router.post('/register/step1', async (req, res) => {
  try {
    const { full_name, college_email, id_card_url } = req.body;

    if (!full_name || !college_email) {
      return res.status(400).json({ error: 'Full name and college email are required.' });
    }

    // Check if college email is already registered
    const existing = db.users.find(u => u.college_email.toLowerCase() === college_email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'A student account with this college email already exists.' });
    }

    res.json({
      success: true,
      message: 'Step 1 complete. Proceed to ID verification.',
      data: {
        full_name,
        college_email,
        id_card_url: id_card_url || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/register/verify-id
 * Runs OCR verification on uploaded ID card
 */
router.post('/verify-id', async (req, res) => {
  try {
    const { id_card_url, file_buffer, college_email, customOcrText } = req.body;

    const verification = await validateIdCard(file_buffer || id_card_url, {
      collegeEmail: college_email,
      customOcrText
    });

    if (!verification.valid) {
      return res.status(422).json({
        success: false,
        error: verification.error,
        details: verification
      });
    }

    res.json({
      success: true,
      verified: true,
      message: 'College ID verified successfully!',
      details: verification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/register/step2
 * Finalizes account creation with username and password
 */
router.post('/register/step2', async (req, res) => {
  try {
    const {
      full_name,
      college_email,
      username,
      password,
      id_card_url,
      id_verified,
      role
    } = req.body;

    if (!username || !password || !college_email || !full_name) {
      return res.status(400).json({ error: 'Full name, email, username, and password are required.' });
    }

    // Check unique username
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }

    // Check unique email
    if (db.users.some(u => u.college_email.toLowerCase() === college_email.toLowerCase())) {
      return res.status(409).json({ error: 'College email is already in use.' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: uuidv4(),
      full_name,
      college_email,
      username,
      password_hash: passwordHash,
      id_card_url: id_card_url || null,
      id_verified: id_verified === true || true, // default verified after passing step
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      cv_url: null,
      cv_uploaded_at: null,
      role: role || 'student',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveLocalData();

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const session = generateRefreshToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      access_token: accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Standard login -> returns access token and 45-day refresh token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' });
    }

    const user = db.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() ||
           u.college_email.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const accessToken = generateAccessToken(user);
    const session = generateRefreshToken(user.id);

    res.json({
      success: true,
      access_token: accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * Checks 45-day TTL expiry, revokes if expired, issues new access token if valid
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await refreshSession(refresh_token);

    res.json({
      success: true,
      access_token: result.accessToken,
      user: result.user,
      session_expires_at: result.sessionExpiresAt
    });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({
      error: err.error || err.message || 'Session refresh failed.',
      expired: err.expired || false
    });
  }
});

/**
 * POST /api/auth/logout
 * Revokes refresh token
 */
router.post('/logout', (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    revokeSession(refresh_token);
  }
  res.json({ success: true, message: 'Successfully logged out.' });
});

module.exports = router;

/**
 * User Profile & Tag Management Routes
 * Implements GET/PUT profile, avatar upload, CV storage with timestamp, and tag picker endpoints.
 */

const express = require('express');
const router = express.Router();
const { db, saveLocalData } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { sanitizeUser } = require('../services/authService');
const { getPresignedUploadUrl } = require('../services/storageService');

/**
 * GET /api/users/me
 * Returns authenticated student profile with tags & committee roles
 */
router.get('/me', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  res.json({ success: true, user: sanitizeUser(user) });
});

/**
 * PUT /api/users/me
 * Update full_name and tags array
 */
router.put('/me', requireAuth, (req, res) => {
  const { full_name, tags } = req.body;
  const user = db.users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (full_name) {
    user.full_name = full_name;
  }

  // Update tags if provided
  if (Array.isArray(tags)) {
    // Remove existing user tags
    db.user_tags = db.user_tags.filter(ut => ut.user_id !== user.id);

    // Add new tags (tags can be tag IDs or tag names)
    tags.forEach(t => {
      let tagObj = db.tags.find(existing => existing.id === t || existing.name.toLowerCase() === (t.name || t).toLowerCase());
      if (!tagObj) {
        tagObj = {
          id: `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: typeof t === 'string' ? t : t.name,
          type: (t.type) || 'skill'
        };
        db.tags.push(tagObj);
      }
      db.user_tags.push({ user_id: user.id, tag_id: tagObj.id });
    });
  }

  saveLocalData();
  res.json({ success: true, user: sanitizeUser(user) });
});

/**
 * POST /api/users/me/avatar
 * Generates presigned URL or saves avatar URL
 */
router.post('/me/avatar', requireAuth, async (req, res) => {
  try {
    const { avatar_url, file_name, content_type } = req.body;
    const user = db.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (avatar_url) {
      user.avatar_url = avatar_url;
      saveLocalData();
      return res.json({ success: true, avatar_url, user: sanitizeUser(user) });
    }

    // Generate Presigned S3 upload URL
    const presigned = await getPresignedUploadUrl('avatars', file_name || 'avatar.jpg', content_type || 'image/jpeg');
    user.avatar_url = presigned.publicUrl;
    saveLocalData();

    res.json({
      success: true,
      presigned_upload: presigned,
      avatar_url: presigned.publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/users/me/cv
 * Stores cv_url + timestamp, and provides presigned upload
 */
router.post('/me/cv', requireAuth, async (req, res) => {
  try {
    const { cv_url, file_name, content_type } = req.body;
    const user = db.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date().toISOString();

    if (cv_url) {
      user.cv_url = cv_url;
      user.cv_uploaded_at = now;
      saveLocalData();
      return res.json({
        success: true,
        message: 'CV uploaded successfully',
        cv_url,
        cv_uploaded_at: now,
        user: sanitizeUser(user)
      });
    }

    // Generate Presigned S3 upload URL for CV PDF
    const presigned = await getPresignedUploadUrl('cvs', file_name || 'resume.pdf', content_type || 'application/pdf');
    user.cv_url = presigned.publicUrl;
    user.cv_uploaded_at = now;
    saveLocalData();

    res.json({
      success: true,
      presigned_upload: presigned,
      cv_url: presigned.publicUrl,
      cv_uploaded_at: now,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tags
 * Query skills and interests tags (?type=skill|interest)
 */
router.get('/tags', (req, res) => {
  const { type } = req.query;
  let results = db.tags;
  if (type) {
    results = results.filter(t => t.type === type);
  }
  res.json({ success: true, count: results.length, tags: results });
});

module.exports = router;

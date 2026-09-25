/**
 * Event Recap & Gallery Routes
 * Implements committee event timelines, stats JSONB, media gallery, and RBAC-secured posting.
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, saveLocalData } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireCommitteeAccess } = require('../middleware/requireCommitteeAccess');

/**
 * GET /api/committees/:id/events
 * Returns all past events and recaps for a specific committee
 */
router.get('/committees/:id/events', (req, res) => {
  const committeeId = req.params.id;
  const events = db.event_recaps
    .filter(e => e.committee_id === committeeId)
    .map(e => {
      const media = db.event_media.filter(m => m.event_id === e.id);
      const poster = db.users.find(u => u.id === e.posted_by);
      return {
        ...e,
        media: media.map(m => m.media_url),
        posted_by_user: poster ? {
          id: poster.id,
          full_name: poster.full_name,
          avatar_url: poster.avatar_url
        } : null
      };
    })
    .sort((a, b) => new Date(b.event_date || b.created_at) - new Date(a.event_date || a.created_at));

  res.json({
    success: true,
    committee_id: committeeId,
    count: events.length,
    events
  });
});

/**
 * GET /api/events/feed
 * Global feed of all recent events across committees
 */
router.get('/feed', (req, res) => {
  const events = db.event_recaps.map(e => {
    const committee = db.committees.find(c => c.id === e.committee_id);
    const media = db.event_media.filter(m => m.event_id === e.id);
    const poster = db.users.find(u => u.id === e.posted_by);
    return {
      ...e,
      committee_name: committee ? committee.name : 'Unknown Committee',
      media: media.map(m => m.media_url),
      posted_by_user: poster ? {
        id: poster.id,
        full_name: poster.full_name,
        avatar_url: poster.avatar_url
      } : null
    };
  }).sort((a, b) => new Date(b.event_date || b.created_at) - new Date(a.event_date || a.created_at));

  res.json({ success: true, count: events.length, events });
});

/**
 * GET /api/events/:id
 * Single event recap detail with full media gallery
 */
router.get('/:id', (req, res) => {
  const event = db.event_recaps.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event recap not found.' });
  }

  const committee = db.committees.find(c => c.id === event.committee_id);
  const media = db.event_media.filter(m => m.event_id === event.id);
  const poster = db.users.find(u => u.id === event.posted_by);

  res.json({
    success: true,
    event: {
      ...event,
      committee,
      media: media.map(m => m.media_url),
      posted_by_user: poster ? {
        id: poster.id,
        full_name: poster.full_name,
        avatar_url: poster.avatar_url
      } : null
    }
  });
});

/**
 * POST /api/committees/:id/events
 * Creates new event recap.
 * SECURED: Requires Bearer Auth and RBAC matching committee_email in department_members!
 */
router.post(
  '/committees/:id/events',
  requireAuth,
  requireCommitteeAccess,
  (req, res) => {
    try {
      const committeeId = req.params.id;
      const { title, event_date, description, achievements, stats, media_urls } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Event title is required.' });
      }

      const committee = db.committees.find(c => c.id === committeeId);
      if (!committee) {
        return res.status(404).json({ error: 'Committee not found.' });
      }

      const newEvent = {
        id: uuidv4(),
        committee_id: committeeId,
        title,
        event_date: event_date || new Date().toISOString().split('T')[0],
        description: description || '',
        achievements: achievements || '',
        stats: stats || {}, // JSONB stats e.g. { attendees: 300, revenue: 15000 }
        posted_by: req.user.id,
        created_at: new Date().toISOString()
      };

      db.event_recaps.push(newEvent);

      // Handle media URLs if provided
      if (Array.isArray(media_urls)) {
        media_urls.forEach(url => {
          db.event_media.push({
            id: uuidv4(),
            event_id: newEvent.id,
            media_url: url
          });
        });
      }

      saveLocalData();

      const media = db.event_media.filter(m => m.event_id === newEvent.id).map(m => m.media_url);

      res.status(201).json({
        success: true,
        message: 'Event recap created successfully under committee authorization.',
        event: {
          ...newEvent,
          media
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * POST /api/events/:id/media
 * Uploads media item to an existing event recap
 * SECURED: Requires RBAC authorization
 */
router.post(
  '/:id/media',
  requireAuth,
  (req, res, next) => {
    // Find the event to extract committeeId for RBAC check
    const event = db.event_recaps.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    req.params.committeeId = event.committee_id;
    next();
  },
  requireCommitteeAccess,
  (req, res) => {
    try {
      const { media_url } = req.body;
      if (!media_url) {
        return res.status(400).json({ error: 'media_url is required.' });
      }

      const newMedia = {
        id: uuidv4(),
        event_id: req.params.id,
        media_url
      };

      db.event_media.push(newMedia);
      saveLocalData();

      res.status(201).json({
        success: true,
        message: 'Media added to event recap.',
        media: newMedia
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

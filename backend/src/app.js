/**
 * Express Application Configuration
 * Connects routes, middleware, CORS, mock storage, and health checks.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const committeesRoutes = require('./routes/committees.routes');
const eventsRoutes = require('./routes/events.routes');
const { UPLOADS_DIR } = require('./services/storageService');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Mock Upload Handler (simulates S3 direct upload for dev)
app.post('/api/storage/mock-upload', (req, res) => {
  const fileKey = req.query.key || `uploads/${Date.now()}.bin`;
  const destPath = path.join(UPLOADS_DIR, path.basename(fileKey));

  // Write incoming stream or json payload to file
  const writeStream = fs.createWriteStream(destPath);
  req.pipe(writeStream);

  writeStream.on('finish', () => {
    res.json({
      success: true,
      message: 'File stored successfully.',
      publicUrl: `/uploads/${path.basename(fileKey)}`
    });
  });

  writeStream.on('error', (err) => {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/committees', committeesRoutes);
app.use('/api/events', eventsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Student Committee Platform API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
